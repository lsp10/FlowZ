/**
 * 渲染进程 IPC 客户端
 * 提供类型安全的 IPC 调用封装
 * 优化版本：支持轻量模式下的通信节流
 */

import { ApiResponse } from '../../shared/types';

interface ElectronIpcRenderer {
  invoke: <T = any>(channel: string, args?: any) => Promise<T>;
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
  once: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
  off: (channel: string, listener: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

/**
 * 获取 IPC Renderer 实例
 */
function getIpcRenderer(): ElectronIpcRenderer {
  if (!window.electron?.ipcRenderer) {
    console.warn('IPC Renderer is not available. Using mock for browser preview.');
    return {
      invoke: async <T>() => ({ success: true, data: [] }) as unknown as T,
      on: () => {},
      once: () => {},
      off: () => {},
      removeAllListeners: () => {},
    };
  }
  return window.electron.ipcRenderer as ElectronIpcRenderer;
}

/**
 * IPC 客户端类
 * 提供类型安全的 IPC 调用和事件监听
 * 优化版本：支持请求节流和缓存
 */
type EventListener = (...args: any[]) => void;

export class IpcClient {
  private ipcRenderer: ElectronIpcRenderer;
  private eventListeners: Map<string, Set<EventListener>> = new Map();

  // 优化：请求节流和缓存
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private readonly CACHE_TTL = 1000; // 1秒缓存
  private readonly THROTTLE_INTERVAL = 100; // 100ms节流间隔
  private lastRequestTime: Map<string, number> = new Map();

  constructor() {
    this.ipcRenderer = getIpcRenderer();

    // 定期清理过期缓存
    setInterval(() => {
      this.cleanupCache();
    }, 5000);
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, { timestamp }] of this.requestCache.entries()) {
      if (now - timestamp > this.CACHE_TTL) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(channel: string, args?: any): string {
    return `${channel}:${JSON.stringify(args)}`;
  }

  /**
   * 检查是否应该节流请求
   */
  private shouldThrottle(channel: string): boolean {
    const lastTime = this.lastRequestTime.get(channel) || 0;
    const now = Date.now();
    return now - lastTime < this.THROTTLE_INTERVAL;
  }

  /**
   * 调用主进程方法
   * @param channel IPC 通道名称
   * @param args 参数
   * @returns 响应数据
   */
  async invoke<TArgs = any, TResult = any>(channel: string, args?: TArgs): Promise<TResult> {
    const cacheKey = this.getCacheKey(channel, args);

    // 检查缓存（仅对状态查询类请求启用缓存）
    const isCacheable = channel.includes('get') || channel.includes('status');
    if (isCacheable) {
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log(`[IPC Client] Cache hit: ${channel}`);
        return cached.data;
      }
    }

    // 检查是否有相同的请求正在进行中
    const pendingKey = `${channel}:${JSON.stringify(args)}`;
    if (this.pendingRequests.has(pendingKey)) {
      console.log(`[IPC Client] Reusing pending request: ${channel}`);
      return this.pendingRequests.get(pendingKey)!;
    }

    // 节流检查
    if (this.shouldThrottle(channel)) {
      console.log(`[IPC Client] Throttling request: ${channel}`);
      await new Promise((resolve) => setTimeout(resolve, this.THROTTLE_INTERVAL));
    }

    try {
      console.log(`[IPC Client] Invoking: ${channel}`, args);
      this.lastRequestTime.set(channel, Date.now());

      const requestPromise = this.ipcRenderer
        .invoke(channel, args)
        .then((response: ApiResponse<TResult>) => {
          if (!response.success) {
            const error = new Error(response.error || 'Unknown error');
            (error as any).code = response.code;
            throw error;
          }

          // 缓存成功的响应
          if (isCacheable) {
            this.requestCache.set(cacheKey, {
              data: response.data,
              timestamp: Date.now(),
            });
          }

          console.log(`[IPC Client] Success: ${channel}`, response.data);
          return response.data as TResult;
        });

      // 记录待处理的请求
      this.pendingRequests.set(pendingKey, requestPromise);

      const result = await requestPromise;

      // 清理待处理的请求
      this.pendingRequests.delete(pendingKey);

      return result;
    } catch (error) {
      this.pendingRequests.delete(pendingKey);
      console.error(`[IPC Client] Error invoking ${channel}:`, error);
      throw error;
    }
  }

  /**
   * 监听主进程事件
   * @param channel 事件通道名称
   * @param listener 事件监听器
   * @returns 取消监听函数
   */
  on<T = any>(channel: string, listener: (data: T) => void): () => void {
    console.log(`[IPC Client] Registering listener for: ${channel}`);

    // 包装监听器以提取数据
    const wrappedListener = (_event: any, data: T) => {
      console.log(`[IPC Client] Received event: ${channel}`, data);
      listener(data);
    };

    // 注册监听器
    this.ipcRenderer.on(channel, wrappedListener);

    // 记录监听器以便管理
    if (!this.eventListeners.has(channel)) {
      this.eventListeners.set(channel, new Set());
    }
    this.eventListeners.get(channel)!.add(wrappedListener);

    // 返回取消监听函数
    return () => {
      this.off(channel, wrappedListener);
    };
  }

  /**
   * 监听主进程事件（仅一次）
   * @param channel 事件通道名称
   * @param listener 事件监听器
   */
  once<T = any>(channel: string, listener: (data: T) => void): void {
    console.log(`[IPC Client] Registering one-time listener for: ${channel}`);

    const wrappedListener = (_event: any, data: T) => {
      console.log(`[IPC Client] Received one-time event: ${channel}`, data);
      listener(data);
    };

    this.ipcRenderer.once(channel, wrappedListener);
  }

  /**
   * 取消监听主进程事件
   * @param channel 事件通道名称
   * @param listener 事件监听器（可选，不提供则移除所有监听器）
   */
  off(channel: string, listener?: EventListener): void {
    if (listener) {
      this.ipcRenderer.off(channel, listener as any);

      const listeners = this.eventListeners.get(channel);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(channel);
        }
      }

      console.log(`[IPC Client] Removed listener for: ${channel}`);
    } else {
      this.ipcRenderer.removeAllListeners(channel);
      this.eventListeners.delete(channel);
      console.log(`[IPC Client] Removed all listeners for: ${channel}`);
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(): void {
    for (const channel of this.eventListeners.keys()) {
      this.ipcRenderer.removeAllListeners(channel);
    }
    this.eventListeners.clear();
    console.log(`[IPC Client] Removed all listeners`);
  }

  /**
   * 获取已注册的事件通道列表
   */
  getRegisteredChannels(): string[] {
    return Array.from(this.eventListeners.keys());
  }

  /**
   * 获取指定通道的监听器数量
   */
  getListenerCount(channel: string): number {
    return this.eventListeners.get(channel)?.size || 0;
  }
}

/**
 * 全局 IPC 客户端实例
 */
export const ipcClient = new IpcClient();

/**
 * 便捷函数：调用主进程方法
 */
export async function invoke<TArgs = any, TResult = any>(
  channel: string,
  args?: TArgs
): Promise<TResult> {
  return ipcClient.invoke<TArgs, TResult>(channel, args);
}

/**
 * 便捷函数：监听主进程事件
 */
export function on<T = any>(channel: string, listener: (data: T) => void): () => void {
  return ipcClient.on<T>(channel, listener);
}

/**
 * 便捷函数：监听主进程事件（仅一次）
 */
export function once<T = any>(channel: string, listener: (data: T) => void): void {
  ipcClient.once<T>(channel, listener);
}

/**
 * 便捷函数：取消监听主进程事件
 */
export function off(channel: string, listener?: EventListener): void {
  ipcClient.off(channel, listener);
}
