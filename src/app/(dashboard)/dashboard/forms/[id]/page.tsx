'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus, ArrowLeft, AlertCircle, Check, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormSummary } from '@/components/forms/form-summary';
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

function getPatientIdentity(data: Record<string, unknown>) {
  const patientName = typeof data.fullName === 'string' ? data.fullName
    : typeof data.customerName === 'string' ? data.customerName
    : null;
  const patientDob = typeof data.dateOfBirth === 'string' ? data.dateOfBirth : null;
  return { patientName, patientDob };
}

async function blobUrlToBase64(url: string): Promise<string> {
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function throwIfNotOk(res: Response) {
  if (res.ok) return;
  const body = await res.json().catch(() => null);
  throw new Error(body?.error ?? 'Failed to save form');
}

export default function FormReviewPage() {
  const router = useRouter();
  const {
    selectedFormType,
    selectedFormLabel,
    extractedData,
    pdfBlobUrl,
    missingFields,
    reviewSchema,
    reset,
  } = useFormFlowStore();
  // Store is populated before navigating here (no persist), so seed once on mount.
  const [editableData, setEditableData] = useState<Record<string, unknown>>(() => extractedData ?? {});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const hasSavedRef = useRef(false);
  const [savedFormId, setSavedFormId] = useState<string | null>(null);
  const lastSavedUrlRef = useRef<string | null>(null);

  const { previewUrl, isGenerating } = usePdfPreview({
    formType: selectedFormType,
    editableData,
    enabled: true,
  });

  // Auto-save when PDF preview becomes available
  useEffect(() => {
    if (!previewUrl || hasSavedRef.current || !selectedFormType || !selectedFormLabel) return;
    hasSavedRef.current = true;

    const autoSave = async () => {
      setSaveStatus('saving');
      try {
        lastSavedUrlRef.current = previewUrl;
        const saveRes = await fetch('/api/saved-forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: selectedFormType,
            formName: selectedFormLabel,
            extractedData: editableData,
            pdfBase64: await blobUrlToBase64(previewUrl),
            patientId: null,
            ...getPatientIdentity(editableData),
          }),
        });
        await throwIfNotOk(saveRes);
        const body = await saveRes.json();

        setSavedFormId(body.form.id);
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

  // Persist edits: once the form exists, re-save ~1.5s after the preview
  // has caught up with the latest edit (previewUrl is derived from editableData).
  useEffect(() => {
    if (!savedFormId || !previewUrl || isGenerating) return;
    if (previewUrl === lastSavedUrlRef.current) return;

    const timer = setTimeout(async () => {
      lastSavedUrlRef.current = previewUrl;
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/saved-forms/${savedFormId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extractedData: editableData,
            pdfBase64: await blobUrlToBase64(previewUrl),
            ...getPatientIdentity(editableData),
          }),
        });
        await throwIfNotOk(res);
        setSaveStatus('saved');
      } catch (err) {
        lastSavedUrlRef.current = null; // allow the next edit to retry
        setSaveStatus('error');
        toast.error(err instanceof Error ? err.message : 'Failed to save form');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [savedFormId, previewUrl, isGenerating, editableData]);

  // Required fields the LLM couldn't fill that are still blank.
  const outstandingMissing = useMemo(() => {
    const labels = new Map<string, string>();
    for (const section of reviewSchema?.sections ?? []) {
      for (const field of section.fields) labels.set(field.key, field.label);
    }
    return missingFields
      .filter((key) => {
        const value = editableData[key];
        return value == null || String(value).trim() === '';
      })
      .map((key) => labels.get(key) ?? key);
  }, [missingFields, reviewSchema, editableData]);

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

    const { patientName, patientDob } = getPatientIdentity(editableData);

    const a = document.createElement('a');
    a.href = blobSource;
    a.download = buildPdfFilename(selectedFormType, patientName, patientDob);
    a.click();
  };

  // Editor + preview layout. No outer scroll — the page is a flex column that
  // fills the viewport; the editor column and the PDF viewer scroll internally.
  // Below lg the PDF iframe is hidden (poor on iOS); Download still works.
  return (
    <div className="flex-1 min-h-0 flex flex-col -m-4 lg:-m-6">
      <div className="flex-1 min-h-0 flex gap-4 w-full px-4 pt-2 pb-1">
        <div className="w-full lg:w-2/5 min-h-0 overflow-y-auto space-y-3 pb-2">
          {outstandingMissing.length > 0 && (
            <div className="flex gap-2.5 p-3 rounded-lg border border-warning/30 bg-warning/5" role="status">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-foreground">
                  {outstandingMissing.length} required field{outstandingMissing.length === 1 ? '' : 's'}{' '}
                  {outstandingMissing.length === 1 ? "wasn't" : "weren't"} in your dictation
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {outstandingMissing.join(', ')}
                </p>
              </div>
            </div>
          )}
          <FormSummary
            schema={reviewSchema}
            data={editableData}
            missingFields={missingFields}
            onChange={(key, value) => setEditableData((prev) => ({ ...prev, [key]: value }))}
          />
        </div>
        <div className="hidden lg:block flex-1 min-w-0 min-h-0">
          <PdfPreviewPanel
            previewUrl={previewUrl}
            isLoading={isGenerating}
            fullWidth
            fillContainer
          />
        </div>
      </div>

      {/* Pinned footer — solid, no scroll on this page */}
      <div className="shrink-0 border-t bg-card py-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="w-full px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
