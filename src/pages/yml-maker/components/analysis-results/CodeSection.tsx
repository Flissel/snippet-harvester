
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Separator } from '@/components/ui/separator';
import type { ResultSection } from './types';

interface CodeSectionProps {
  section: ResultSection;
  isLast: boolean;
}

export function CodeSection({ section, isLast }: CodeSectionProps) {
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-sm text-muted-foreground">
        {section.title}
      </h5>
      <div className="rounded-md overflow-hidden">
        <SyntaxHighlighter
          language={section.language}
          style={docco}
          customStyle={{
            margin: 0,
            padding: '1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: 'hsl(var(--muted))',
          }}
        >
          {section.content}
        </SyntaxHighlighter>
      </div>
      {!isLast && <Separator className="my-4" />}
    </div>
  );
}
