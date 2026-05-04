import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/ipc/api-client';

interface RouteRule {
  protocol?: string;
  network?: string[];
  rule_set?: string | string[];
  domain?: string[];
  domain_suffix?: string[];
  domain_keyword?: string[];
  geosite?: string[];
  ip_cidr?: string[];
  port?: number | number[];
  process_name?: string | string[];
  process_name_not?: string | string[];
  inbound?: string | string[];
  action: string;
  outbound?: string;
}

function formatConditions(rule: RouteRule): { label: string; values: string[] }[] {
  const conditions: { label: string; values: string[] }[] = [];

  const add = (label: string, val: unknown) => {
    if (!val) return;
    const arr = Array.isArray(val) ? val.map(String) : [String(val)];
    if (arr.length > 0) conditions.push({ label, values: arr });
  };

  add('protocol', rule.protocol);
  add('network', rule.network);
  add('inbound', rule.inbound);
  add('process_name', rule.process_name);
  add('process_name_not', rule.process_name_not);
  add('domain', rule.domain);
  add('domain_suffix', rule.domain_suffix);
  add('domain_keyword', rule.domain_keyword);
  add('rule_set', rule.rule_set);
  add('geosite', rule.geosite);
  add('ip_cidr', rule.ip_cidr);
  add('port', rule.port);

  return conditions;
}

function outboundColor(outbound?: string): string {
  if (!outbound) return '';
  const lower = outbound.toLowerCase();
  if (lower === 'direct') return 'text-green-500';
  if (lower.includes('reject') || lower.includes('block')) return 'text-red-500';
  return 'text-blue-500';
}

function actionColor(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action === 'route') return 'secondary';
  if (action === 'reject' || action === 'block') return 'destructive';
  return 'outline';
}

export function RouteRulesCard() {
  const [rules, setRules] = useState<RouteRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.proxy.getRouteRules();
      setRules(data || []);
    } catch (e: any) {
      setError(e.message || '获取路由规则失败');
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">路由规则总览</CardTitle>
          <CardDescription>
            当前 sing-box 生效的全部路由规则，按优先级从高到低排列（共 {rules.length} 条）
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRules} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-1.5">刷新</span>
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-destructive mb-3">{error}</div>}
        {!loading && rules.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            暂无路由规则，请先启动代理
          </div>
        )}
        {rules.length > 0 && (
          <ScrollArea className="max-h-[520px] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="text-left px-3 py-2 w-10 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                    匹配条件
                  </th>
                  <th className="text-left px-3 py-2 w-20 font-medium text-muted-foreground">
                    动作
                  </th>
                  <th className="text-left px-3 py-2 w-32 font-medium text-muted-foreground">
                    出口
                  </th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, idx) => {
                  const conditions = formatConditions(rule);
                  const isExpanded = expandedRows.has(idx);
                  const hasMany = conditions.some((c) => c.values.length > 3);

                  return (
                    <tr
                      key={idx}
                      className="border-b last:border-b-0 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => hasMany && toggleRow(idx)}
                    >
                      <td className="px-3 py-2 text-muted-foreground tabular-nums align-top">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {conditions.length === 0 ? (
                          <span className="text-muted-foreground italic">（无条件）</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 items-start">
                            {conditions.map((cond) => {
                              const display =
                                !isExpanded && cond.values.length > 3
                                  ? cond.values.slice(0, 3)
                                  : cond.values;
                              const truncated = !isExpanded && cond.values.length > 3;

                              return (
                                <span
                                  key={cond.label}
                                  className="inline-flex flex-wrap items-center gap-0.5"
                                >
                                  <span className="text-[10px] text-muted-foreground mr-0.5">
                                    {cond.label}:
                                  </span>
                                  {display.map((v) => (
                                    <Badge
                                      key={v}
                                      variant="outline"
                                      className="text-[11px] px-1.5 py-0 font-mono"
                                    >
                                      {v}
                                    </Badge>
                                  ))}
                                  {truncated && (
                                    <span className="text-[10px] text-muted-foreground flex items-center">
                                      +{cond.values.length - 3}
                                      <ChevronRight className="h-3 w-3 ml-0.5" />
                                    </span>
                                  )}
                                  {isExpanded && cond.values.length > 3 && (
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Badge variant={actionColor(rule.action)} className="text-[11px]">
                          {rule.action}
                        </Badge>
                      </td>
                      <td
                        className={`px-3 py-2 align-top font-medium ${outboundColor(rule.outbound)}`}
                      >
                        {rule.outbound || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
