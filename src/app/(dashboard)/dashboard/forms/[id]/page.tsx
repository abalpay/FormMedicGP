'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, ArrowLeft, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfPreviewPanel } from '@/components/forms/pdf-preview-panel';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import { usePdfPreview } from '@/hooks/use-pdf-preview';
import { toast } from 'sonner';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { previewUrl, isGenerating } = usePdfPreview({
    formType: selectedFormType,
    editableData,
    enabled: true,
  });

  useEffect(() => {
    setEditableData(extractedData ?? {});
  }, [extractedData]);

  useEffect(() => {
    toast.info('Click any field in the PDF to edit it directly. Use the download button (↓) to save.', { id: 'pdf-edit-hint', duration: 6000 });
  }, []);

  const handleNewForm = () => {
    reset();
    router.push('/dashboard/forms/new');
  };

  const handleSave = async () => {
    if (!selectedFormType || !selectedFormLabel) {
      toast.error('No form type selected.');
      return;
    }

    setIsSaving(true);
    try {
      // Convert blob URL to base64
      let pdfBase64 = '';
      const blobSource = previewUrl ?? pdfBlobUrl;
      if (blobSource) {
        const res = await fetch(blobSource);
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        pdfBase64 = btoa(binary);
      }

      const saveRes = await fetch('/api/saved-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: selectedFormType,
          formName: selectedFormLabel,
          extractedData: editableData,
          pdfBase64,
          patientId: null,
        }),
      });

      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to save form');
      }

      setIsSaved(true);
      toast.success('Form saved successfully', {
        action: {
          label: 'View Dashboard',
          onClick: () => router.push('/dashboard'),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save form';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
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
          <Button variant="ghost" asChild>
            <Link href="/dashboard/dictate">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Describe
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Use the download button in the PDF viewer toolbar to save your edits
            </p>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || isSaved}
            >
              {isSaved ? (
                <Check className="w-4 h-4 mr-1.5" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Form'}
            </Button>
            <Button variant="outline" onClick={handleNewForm}>
              <FilePlus className="w-4 h-4 mr-1.5" />
              New Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
