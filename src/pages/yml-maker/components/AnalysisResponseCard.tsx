
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AnalysisResponseCardProps {
  response: any | null;
  isLoading: boolean;
}

export function AnalysisResponseCard({ response, isLoading }: AnalysisResponseCardProps) {
  if (!response && !isLoading) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Analysis Response</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
              {JSON.stringify(response, null, 2)}
            </pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
