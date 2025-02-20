
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ExecutionLog {
  timestamp: string;
  functionId: string;
  message: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  event_message?: string;
  execution_time_ms?: number;
}

interface ExecutionLogsProps {
  logs: ExecutionLog[];
}

export function ExecutionLogs({ logs }: ExecutionLogsProps) {
  if (!logs.length) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Execution Logs</h3>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded-md text-sm ${
                log.status === 'failed' ? 'bg-destructive/10' :
                log.status === 'completed' ? 'bg-green-500/10' :
                log.status === 'in_progress' ? 'bg-blue-500/10' :
                'bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{log.functionId}</span>
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
