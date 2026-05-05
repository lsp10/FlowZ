/**
 * 内存监控工具
 * 用于轻量模式下的内存使用监控和优化
 */

import { EventEmitter } from 'events';

export interface MemoryStats {
  rss: number; // 常驻内存集
  heapTotal: number; // 堆总大小
  heapUsed: number; // 已使用堆大小
  external: number; // 外部内存使用
  arrayBuffers: number; // ArrayBuffer 使用
}

export interface MemoryThresholds {
  heapUsedMB: number; // 堆使用阈值（MB）
  rssMB: number; // RSS 阈值（MB）
  gcTriggerMB: number; // 触发 GC 的阈值（MB）
}

export class MemoryMonitor extends EventEmitter {
  private monitorInterval: NodeJS.Timeout | null = null;
  private isLightweightMode = false;
  private readonly defaultThresholds: MemoryThresholds = {
    heapUsedMB: 100, // 100MB
    rssMB: 200, // 200MB
    gcTriggerMB: 80, // 80MB 触发 GC
  };
  private thresholds: MemoryThresholds;
  private lastGcTime = 0;
  private readonly GC_COOLDOWN = 30000; // GC 冷却时间 30 秒

  constructor(thresholds?: Partial<MemoryThresholds>) {
    super();
    this.thresholds = { ...this.defaultThresholds, ...thresholds };
  }

  /**
   * 开始内存监控
   */
  start(intervalMs: number = 10000): void {
    if (this.monitorInterval) {
      this.stop();
    }

    this.monitorInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    console.log(`[MemoryMonitor] Started monitoring with ${intervalMs}ms interval`);
  }

  /**
   * 停止内存监控
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('[MemoryMonitor] Stopped monitoring');
    }
  }

  /**
   * 进入轻量模式
   */
  enterLightweightMode(): void {
    this.isLightweightMode = true;
    // 轻量模式下使用更严格的阈值
    this.thresholds = {
      heapUsedMB: 50, // 50MB
      rssMB: 100, // 100MB
      gcTriggerMB: 40, // 40MB 触发 GC
    };
    console.log('[MemoryMonitor] Entered lightweight mode with stricter thresholds');
  }

  /**
   * 退出轻量模式
   */
  exitLightweightMode(): void {
    this.isLightweightMode = false;
    this.thresholds = { ...this.defaultThresholds };
    console.log('[MemoryMonitor] Exited lightweight mode');
  }

  /**
   * 获取当前内存统计
   */
  getMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();
    return {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    };
  }

  /**
   * 格式化内存大小为 MB
   */
  private formatMB(bytes: number): number {
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): void {
    const stats = this.getMemoryStats();
    const heapUsedMB = this.formatMB(stats.heapUsed);
    const rssMB = this.formatMB(stats.rss);
    const heapTotalMB = this.formatMB(stats.heapTotal);

    // 发出内存统计事件
    this.emit('memoryStats', {
      heapUsedMB,
      rssMB,
      heapTotalMB,
      externalMB: this.formatMB(stats.external),
      arrayBuffersMB: this.formatMB(stats.arrayBuffers),
    });

    // 检查是否需要触发 GC
    if (heapUsedMB > this.thresholds.gcTriggerMB) {
      this.triggerGarbageCollection();
    }

    // 检查内存阈值
    if (heapUsedMB > this.thresholds.heapUsedMB) {
      this.emit('memoryWarning', {
        type: 'heapUsed',
        current: heapUsedMB,
        threshold: this.thresholds.heapUsedMB,
        message: `堆内存使用过高: ${heapUsedMB}MB (阈值: ${this.thresholds.heapUsedMB}MB)`,
      });
    }

    if (rssMB > this.thresholds.rssMB) {
      this.emit('memoryWarning', {
        type: 'rss',
        current: rssMB,
        threshold: this.thresholds.rssMB,
        message: `常驻内存使用过高: ${rssMB}MB (阈值: ${this.thresholds.rssMB}MB)`,
      });
    }

    // 轻量模式下的额外检查
    if (this.isLightweightMode) {
      // 检查内存增长趋势
      const heapUtilization = (stats.heapUsed / stats.heapTotal) * 100;
      if (heapUtilization > 80) {
        this.emit('memoryWarning', {
          type: 'heapUtilization',
          current: heapUtilization,
          threshold: 80,
          message: `堆内存利用率过高: ${heapUtilization.toFixed(1)}%`,
        });
      }
    }
  }

  /**
   * 触发垃圾回收
   */
  private triggerGarbageCollection(): void {
    const now = Date.now();
    if (now - this.lastGcTime < this.GC_COOLDOWN) {
      return; // 冷却时间内不重复触发
    }

    if (typeof (global as any).gc === 'function') {
      const beforeStats = this.getMemoryStats();
      const beforeHeapMB = this.formatMB(beforeStats.heapUsed);

      (global as any).gc();
      this.lastGcTime = now;

      // 等待一小段时间让 GC 完成
      setTimeout(() => {
        const afterStats = this.getMemoryStats();
        const afterHeapMB = this.formatMB(afterStats.heapUsed);
        const freedMB = beforeHeapMB - afterHeapMB;

        this.emit('gcTriggered', {
          beforeHeapMB,
          afterHeapMB,
          freedMB,
          message: `垃圾回收完成: 释放了 ${freedMB.toFixed(2)}MB 内存`,
        });

        console.log(
          `[MemoryMonitor] GC triggered: ${beforeHeapMB}MB -> ${afterHeapMB}MB (freed: ${freedMB.toFixed(2)}MB)`
        );
      }, 100);
    } else {
      console.warn('[MemoryMonitor] GC not available, cannot trigger garbage collection');
    }
  }

  /**
   * 手动触发垃圾回收
   */
  forceGarbageCollection(): void {
    this.lastGcTime = 0; // 重置冷却时间
    this.triggerGarbageCollection();
  }

  /**
   * 获取内存使用报告
   */
  getMemoryReport(): string {
    const stats = this.getMemoryStats();
    const heapUsedMB = this.formatMB(stats.heapUsed);
    const rssMB = this.formatMB(stats.rss);
    const heapTotalMB = this.formatMB(stats.heapTotal);
    const externalMB = this.formatMB(stats.external);
    const heapUtilization = ((stats.heapUsed / stats.heapTotal) * 100).toFixed(1);

    return [
      '=== 内存使用报告 ===',
      `常驻内存 (RSS): ${rssMB}MB`,
      `堆总大小: ${heapTotalMB}MB`,
      `堆已使用: ${heapUsedMB}MB (${heapUtilization}%)`,
      `外部内存: ${externalMB}MB`,
      `模式: ${this.isLightweightMode ? '轻量模式' : '正常模式'}`,
      `阈值: 堆=${this.thresholds.heapUsedMB}MB, RSS=${this.thresholds.rssMB}MB`,
      '==================',
    ].join('\n');
  }
}

// 全局内存监控实例
export const memoryMonitor = new MemoryMonitor();
