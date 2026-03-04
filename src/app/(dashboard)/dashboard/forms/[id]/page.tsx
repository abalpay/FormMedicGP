'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus, ArrowLeft, Check, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfPreviewPanel } from '@/components/forms/pdf-preview-panel';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import { usePdfPreview } from '@/hooks/use-pdf-preview';
import { toast } from 'sonner';

function buildPdfFilename(
  formType: string | null,
  patientName: string | null,
  patientDob: string | null,
): string {
  const parts: string[] = [];
  if (formType) parts.push(formType);
  if (patientName) parts.push(patientName.replace(/\s+/g, '-'));
  if (patientDob) parts.push(patientDob);
  parts.push(new Date().toISOString().slice(0, 10));
  return `${parts.join('_')}.pdf`;
}

export default function FormReviewPage() {
  const router = useRouter();
  const {
    selectedFormType,
    selectedFormLabel,
    extractedData,
    pdfBlobUrl,
    reset,
  } = useFormFlowStore();
  const [editableData, setEditableData] = useState<Record<string, unknown>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const hasSavedRef = useRef(false);

  const { previewUrl, isGenerating } = usePdfPreview({
    formType: selectedFormType,
    editableData,
    enabled: true,
  });

  useEffect(() => {
    setEditableData(extractedData ?? {});
  }, [extractedData]);

  // Auto-save when PDF preview becomes available
  useEffect(() => {
    if (!previewUrl || hasSavedRef.current || !selectedFormType || !selectedFormLabel) return;
    hasSavedRef.current = true;

    const autoSave = async () => {
      setSaveStatus('saving');
      try {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const pdfBase64 = btoa(binary);

        const patientName = typeof editableData.fullName === 'string' ? editableData.fullName
          : typeof editableData.customerName === 'string' ? editableData.customerName
          : null;
        const patientDob = typeof editableData.dateOfBirth === 'string' ? editableData.dateOfBirth : null;

        const saveRes = await fetch('/api/saved-forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: selectedFormType,
            formName: selectedFormLabel,
            extractedData: editableData,
            pdfBase64,
            patientId: null,
            patientName,
            patientDob,
          }),
        });

        if (!saveRes.ok) {
          const body = await saveRes.json().catch(() => null);
          throw new Error(body?.error ?? 'Failed to save form');
        }

        setSaveStatus('saved');
        router.refresh();
        toast.success('Form saved automatically');
      } catch (err) {
        setSaveStatus('error');
        const message = err instanceof Error ? err.message : 'Failed to save form';
        toast.error(message);
      }
    };

    autoSave();
  }, [previewUrl, selectedFormType, selectedFormLabel, editableData, router]);

  useEffect(() => {
    if (saveStatus !== 'saving') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  const handleNewForm = () => {
    if (saveStatus === 'saving') return;
    reset();
    router.push('/dashboard/forms/new');
  };

  const handleBackToDescribe = () => {
    if (saveStatus === 'saving') return;
    router.push('/dashboard/dictate');
  };

  const handleDownload = () => {
    const blobSource = previewUrl ?? pdfBlobUrl;
    if (!blobSource) return;

    const patientName = typeof editableData.fullName === 'string' ? editableData.fullName
      : typeof editableData.customerName === 'string' ? editableData.customerName
      : null;
    const patientDob = typeof editableData.dateOfBirth === 'string' ? editableData.dateOfBirth : null;

    const a = document.createElement('a');
    a.href = blobSource;
    a.download = buildPdfFilename(selectedFormType, patientName, patientDob);
    a.click();
  };

  // PDF-primary layout for all forms.
  // No outer scroll — the page is a flex column that fills the viewport.
  // The compact header and footer are fixed-size; the PDF iframe fills
  // everything in between via flex-1. Only the PDF viewer scrolls internally.
  return (
    <div className="flex-1 min-h-0 flex flex-col -m-4 lg:-m-6">
      {/* PDF panel fills all available space */}
      <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full px-4 pt-2 pb-1">
        <PdfPreviewPanel
          previewUrl={previewUrl}
          isLoading={isGenerating}
          fullWidth
          fillContainer
        />
      </div>

      {/* Pinned footer — solid, no scroll on this page */}
      <div className="shrink-0 border-t bg-card py-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="max-w-5xl mx-auto w-full px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleBackToDescribe} disabled={saveStatus === 'saving'}>
            <>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Describe
            </>
          </Button>
          <div className="flex items-center gap-3">
            {saveStatus === 'saving' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-500" />
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-destructive flex items-center gap-1.5">
                Save failed
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!previewUrl && !pdfBlobUrl}
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleNewForm} disabled={saveStatus === 'saving'}>
              <FilePlus className="w-4 h-4 mr-1.5" />
              New Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
