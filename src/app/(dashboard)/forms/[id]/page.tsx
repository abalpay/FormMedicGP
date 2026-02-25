'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, FilePlus, ArrowLeft, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { FormSummary } from '@/components/forms/form-summary';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
import { getFormSchema } from '@/lib/schemas';
import { validateEditedData } from '@/lib/form-validation';
import {
  evaluateReviewDownloadState,
  hasUnappliedEdits,
} from '@/lib/review-download-gating';
import { toast } from 'sonner';

const steps = [
  { label: 'Select Form' },
  { label: 'Patient Details' },
  { label: 'Dictate' },
  { label: 'Review' },
];

export default function FormReviewPage() {
  const router = useRouter();
  const {
    selectedFormType,
    selectedFormLabel,
    extractedData,
    missingFields,
    reviewSchema,
    pdfBlobUrl,
    setExtractedData,
    setPdfBlobUrl,
    reset,
  } = useFormFlowStore();
  const [editableData, setEditableData] = useState<Record<string, unknown>>({});
  const [serverValidationErrors, setServerValidationErrors] = useState<Record<string, string>>(
    {}
  );
  const [lastAppliedData, setLastAppliedData] = useState<Record<string, unknown> | null>(
    null
  );
  const [isApplying, setIsApplying] = useState(false);

  const schema = useMemo(
    () => (selectedFormType ? getFormSchema(selectedFormType) : null),
    [selectedFormType]
  );

  useEffect(() => {
    const next = extractedData ?? {};
    setEditableData(next);
    setLastAppliedData(next);
    setServerValidationErrors({});
  }, [extractedData]);

  const liveValidationErrors = useMemo(() => {
    if (!schema) return {};
    return validateEditedData(schema, editableData).errors;
  }, [schema, editableData]);

  const validationErrors = useMemo(
    () => ({ ...liveValidationErrors, ...serverValidationErrors }),
    [liveValidationErrors, serverValidationErrors]
  );

  const unresolvedMissingFields = useMemo(
    () =>
      missingFields.filter((fieldKey) => {
        const value = editableData[fieldKey];
        return value == null || String(value).trim() === '';
      }),
    [missingFields, editableData]
  );

  const hasPendingEdits = useMemo(
    () => hasUnappliedEdits(lastAppliedData, editableData),
    [lastAppliedData, editableData]
  );

  const downloadState = useMemo(
    () =>
      evaluateReviewDownloadState({
        hasPdfBlob: Boolean(pdfBlobUrl),
        validationErrors,
        hasUnappliedEdits: hasPendingEdits,
      }),
    [pdfBlobUrl, validationErrors, hasPendingEdits]
  );

  const handleDownload = () => {
    if (!downloadState.canDownload) {
      if (downloadState.reason === 'validation_errors') {
        toast.error('Please fix highlighted fields before downloading.');
      } else if (downloadState.reason === 'unapplied_edits') {
        toast.error('Apply changes before downloading the updated PDF.');
      } else {
        toast.info('Generate a PDF first.');
      }
      return;
    }

    const a = document.createElement('a');
    a.href = pdfBlobUrl!;
    a.download = 'completed-form.pdf';
    a.click();
    toast.success('PDF downloaded');
  };

  const handleApplyChanges = async () => {
    if (!selectedFormType) {
      toast.error('No form type selected.');
      return;
    }

    if (Object.keys(liveValidationErrors).length > 0) {
      setServerValidationErrors(liveValidationErrors);
      toast.error('Please fix highlighted fields before regenerating.');
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch('/api/process-form/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: selectedFormType,
          editedData: editableData,
        }),
      });

      if (res.status === 400) {
        const body = (await res.json()) as { errors?: Record<string, string> };
        setServerValidationErrors(body.errors ?? {});
        toast.error('Please fix highlighted fields before regenerating.');
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? `Regeneration failed (${res.status})`);
      }

      const { validatedData, pdfBase64 } = (await res.json()) as {
        validatedData: Record<string, unknown>;
        pdfBase64: string;
      };

      setServerValidationErrors({});
      setExtractedData(validatedData);
      setEditableData(validatedData);
      setLastAppliedData(validatedData);

      if (pdfBase64) {
        const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setPdfBlobUrl(URL.createObjectURL(blob));
      }

      toast.success('PDF regenerated with your edits.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to regenerate PDF';
      toast.error(message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleNewForm = () => {
    reset();
    router.push('/forms/new');
  };

  const data = editableData;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StepIndicator steps={steps} currentStep={3} />

      <div className="flex items-center gap-2 animate-fade-in-up">
        <span className="text-sm text-muted-foreground">Form:</span>
        <Badge variant="secondary">{selectedFormLabel ?? selectedFormType}</Badge>
      </div>

      <div className="animate-fade-in-up">
        <h2 className="text-lg font-semibold text-foreground font-[family-name:var(--font-display)]">Form Review</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review the extracted information before downloading.
        </p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <FormSummary
          schema={reviewSchema}
          data={data}
          missingFields={unresolvedMissingFields}
          errors={validationErrors}
          onChange={(key, value) => {
            setServerValidationErrors({});
            setEditableData((prev) => ({ ...prev, [key]: value }));
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <Button variant="ghost" asChild>
          <Link href="/dictate">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dictation
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleApplyChanges} disabled={isApplying}>
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${isApplying ? 'animate-spin' : ''}`}
            />
            {isApplying ? 'Applying...' : 'Apply Changes'}
          </Button>
          <Button variant="outline" onClick={handleNewForm}>
            <FilePlus className="w-4 h-4 mr-1.5" />
            New Form
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!downloadState.canDownload}
            className="gradient-teal text-white border-0 hover:opacity-90"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
