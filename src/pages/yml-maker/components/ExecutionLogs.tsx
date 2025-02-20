
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ExecutionLog {
  timestamp: string;
  functionId: string;
  message: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  event_message?: string;
  execution_time_ms?: number;
  request_data?: any;
  response_data?: any;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
}

export function ExecutionLogs({ logs }: ExecutionLogsProps) {
  const [expandedLogs, setExpandedLogs] = useState<number[]>([]);

  if (!logs.length) return null;

  const toggleExpand = (index: number) => {
    setExpandedLogs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Execution Logs</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {logs.map((log, index) => {
            const isExpanded = expandedLogs.includes(index);
            const hasData = log.request_data || log.response_data;

            return (
              <div
                key={index}
                className={`p-2 rounded-md text-sm ${
                  log.status === 'failed' ? 'bg-destructive/10' :
                  log.status === 'completed' ? 'bg-green-500/10' :
                  log.status === 'in_progress' ? 'bg-blue-500/10' :
                  'bg-muted/50'
                }`}
              >
                <div 
                  className={`flex items-center justify-between ${hasData ? 'cursor-pointer' : ''}`}
                  onClick={() => hasData && toggleExpand(index)}
                >
                  <div className="flex items-center gap-2">
                    {hasData && (
                      isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">{log.functionId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    {log.execution_time_ms && ` • ${log.execution_time_ms}ms`}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{log.message}</p>
                {log.event_message && (
                  <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap border-t border-border/50 pt-1">
                    {log.event_message}
                  </p>
                )}
                {isExpanded && (
                  <div className="mt-2 space-y-2 border-t border-border/50 pt-2">
                    {log.request_data && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Request Data:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(log.request_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.response_data && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Response Data:</p>
                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(log.response_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
