import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { Trash2, ArrowDown, Search, Route } from 'lucide-react';
import { getLogs, clearLogs, addEventListener, removeEventListener } from '@/bridge/api-wrapper';
import type { LogEntry } from '@/bridge/types';
import { useTranslation } from 'react-i18next';

// 优化：减少内存占用的常量
const MAX_LOGS_IN_MEMORY = 50; // 减少内存中保存的日志数量
const MAX_SEARCH_LOGS = 200; // 搜索时最多保留的日志数量
const SCROLL_DEBOUNCE_MS = 200; // 增加滚动防抖时间
const LOG_CLEANUP_INTERVAL = 30000; // 30秒清理一次过期日志

export function RealTimeLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSnapshot, setSearchSnapshot] = useState<LogEntry[] | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionStatus = useAppStore((state) => state.connectionStatus);

  // 优化：使用 useMemo 缓存日志处理逻辑
  const processedLogs = useMemo(() => {
    // 限制内存中的日志数量
    const recentLogs = logs.slice(-MAX_LOGS_IN_MEMORY);
    return recentLogs;
  }, [logs]);

  // Load initial logs and set up real-time updates
  useEffect(() => {
    const loadInitialLogs = async () => {
      try {
        const response = await getLogs(30); // 减少初始加载的日志数量
        if (response && response.success && response.data) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error('Failed to load initial logs:', error);
      }
    };

    loadInitialLogs();

    // Set up real-time log listener with memory optimization
    const handleLogReceived = (logEntry: LogEntry) => {
      setLogs((prev) => {
        const updated = [...prev, logEntry];
        // 更严格的内存控制：保持更少的日志
        return updated.slice(-MAX_LOGS_IN_MEMORY);
      });
    };

    addEventListener('logReceived', handleLogReceived);

    // 设置定期清理定时器
    cleanupIntervalRef.current = setInterval(() => {
      setLogs((prev) => {
        if (prev.length > MAX_LOGS_IN_MEMORY) {
          return prev.slice(-MAX_LOGS_IN_MEMORY);
        }
        return prev;
      });

      // 清理搜索快照以释放内存
      if (searchSnapshot && searchSnapshot.length > MAX_SEARCH_LOGS) {
        setSearchSnapshot((prev) => (prev ? prev.slice(-MAX_SEARCH_LOGS) : null));
      }
    }, LOG_CLEANUP_INTERVAL);

    return () => {
      removeEventListener('logReceived', handleLogReceived);
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [searchSnapshot]);

  // 获取滚动元素
  const getScrollElement = useCallback(() => {
    return scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLElement | null;
  }, []);

  // 检查是否在底部
  const checkIsAtBottom = useCallback((element: HTMLElement) => {
    const threshold = 30;
    return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
  }, []);

  // 优化：增加滚动防抖时间以减少频繁更新
  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const handleScroll = () => {
      setIsUserScrolling(true);

      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }

      userScrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
        const atBottom = checkIsAtBottom(scrollElement);
        setIsAutoScroll(atBottom);
      }, SCROLL_DEBOUNCE_MS); // 使用更长的防抖时间
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [getScrollElement, checkIsAtBottom]);

  // 只有在自动滚动模式且用户没有主动滚动时才自动滚动到底部
  useEffect(() => {
    if (isAutoScroll && !isUserScrolling) {
      const scrollElement = getScrollElement();
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [processedLogs, isAutoScroll, isUserScrolling, getScrollElement]);

  const handleClearLogs = async () => {
    try {
      const success = await clearLogs();
      if (success) {
        setLogs([]);
        setSearchSnapshot(null); // 清理搜索快照
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
      setLogs([]);
      setSearchSnapshot(null);
    }
  };

  const getLevelColor = useCallback((level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-foreground';
    }
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      const prev = searchTerm;
      setSearchTerm(value);
      if (value && !prev) {
        // 开始搜索时保存当前日志快照，但限制数量
        setSearchSnapshot(processedLogs.slice(-MAX_SEARCH_LOGS));
      } else if (!value && prev) {
        // 清除搜索时丢弃快照
        setSearchSnapshot(null);
      }
    },
    [searchTerm, processedLogs]
  );

  // 优化：使用 useMemo 缓存搜索结果
  const { searchBase, filteredLogs } = useMemo(() => {
    const base = searchSnapshot
      ? (() => {
          const snapshotTimestamps = new Set(searchSnapshot.map((l) => l.timestamp + l.message));
          const newLogs = processedLogs.filter(
            (l) => !snapshotTimestamps.has(l.timestamp + l.message)
          );
          return [...searchSnapshot, ...newLogs].slice(-MAX_SEARCH_LOGS); // 限制搜索基础数据量
        })()
      : processedLogs;

    const filtered = searchTerm
      ? base.filter(
          (log) =>
            log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.category === 'route' && 'route'.includes(searchTerm.toLowerCase()))
        )
      : processedLogs; // 非搜索状态使用处理后的日志

    return { searchBase: base, filteredLogs: filtered };
  }, [searchSnapshot, processedLogs, searchTerm]);

  const highlightMatch = useCallback(
    (text: string) => {
      if (!searchTerm) return text;
      const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
      if (idx === -1) return text;
      return (
        <>
          {text.slice(0, idx)}
          <span className="bg-yellow-300/60 dark:bg-yellow-500/40 rounded px-0.5">
            {text.slice(idx, idx + searchTerm.length)}
          </span>
          {text.slice(idx + searchTerm.length)}
        </>
      );
    },
    [searchTerm]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('home.realTimeLogs')}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t('home.searchLogs')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8 w-[160px] pl-8 text-xs"
              />
              {searchTerm && (
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">
                  {filteredLogs.length}/{searchBase.length}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={processedLogs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('home.clear')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollAreaRef} className="h-64 w-full rounded border bg-muted/30 p-3">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {processedLogs.length > 0 && searchTerm
                ? t('home.noLogsMatch')
                : connectionStatus?.proxyCore?.running
                  ? t('home.waitingForLogs')
                  : t('home.plsStartProxy')}
            </div>
          ) : (
            <div className="space-y-1 select-text cursor-text">
              {filteredLogs.map((log, index) => {
                const timestamp = new Date(log.timestamp).toLocaleTimeString('zh-CN');
                const isRoute = log.category === 'route';

                return (
                  <div
                    key={`${log.timestamp}-${index}`} // 优化：使用更稳定的 key
                    className={`text-xs font-mono select-text flex items-start gap-1 ${
                      isRoute
                        ? 'border-l-2 border-emerald-500/70 pl-2 bg-emerald-500/5 rounded-r-sm py-0.5'
                        : ''
                    }`}
                  >
                    {isRoute && <Route className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />}
                    <span>
                      <span className="text-muted-foreground">[{timestamp}]</span>
                      <span
                        className={`ml-2 font-semibold ${isRoute ? 'text-emerald-500' : getLevelColor(log.level)}`}
                      >
                        {isRoute ? 'ROUTE' : log.level.toUpperCase()}:
                      </span>
                      <span className="ml-2">{highlightMatch(log.message)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isAutoScroll ? t('home.autoScrollOn') : t('home.autoScrollOff')}
            {processedLogs.length >= MAX_LOGS_IN_MEMORY && (
              <span className="ml-2 text-yellow-600">(显示最近 {MAX_LOGS_IN_MEMORY} 条)</span>
            )}
          </span>
          {!isAutoScroll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAutoScroll(true);
                const scrollElement = getScrollElement();
                if (scrollElement) {
                  scrollElement.scrollTop = scrollElement.scrollHeight;
                }
              }}
              className="text-xs h-7"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              {t('home.scrollToBottom')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
