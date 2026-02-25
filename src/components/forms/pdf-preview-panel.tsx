'use client';

import { Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfPreviewPanelProps {
  previewUrl: string | null;
  isLoading: boolean;
  /** When true, uses taller iframe height for full-width PDF-primary layout */
  fullWidth?: boolean;
  /** When true, fills parent container via flex layout instead of using calc() height */
  fillContainer?: boolean;
}

export function PdfPreviewPanel({ previewUrl, isLoading, fullWidth, fillContainer }: PdfPreviewPanelProps) {
  const iframeHeight = fullWidth ? 'calc(100vh - 14rem)' : 'calc(100vh - 12rem)';

  return (
    <div className={cn(
      "flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden",
      fillContainer && "h-full"
    )}>
      {!fillContainer && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">PDF Preview</span>
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />
          )}
        </div>
      )}

      {fillContainer && isLoading && (
        <div className="flex items-center gap-2 px-4 py-1.5 border-b bg-muted/30">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Updating…</span>
        </div>
      )}

      {previewUrl ? (
        <iframe
          key={previewUrl}
          src={previewUrl}
          title="PDF Preview"
          className={cn("w-full border-0", fillContainer && "flex-1 min-h-0")}
          style={fillContainer ? undefined : { height: iframeHeight }}
        />
      ) : (
        <div
          className={cn(
            "flex flex-col items-center justify-center text-muted-foreground gap-2",
            fillContainer && "flex-1 min-h-0"
          )}
          style={fillContainer ? undefined : { height: iframeHeight }}
        >
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Generating preview…</span>
        </div>
      )}
    </div>
  );
}
