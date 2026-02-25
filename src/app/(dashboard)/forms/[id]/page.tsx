'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, FilePlus, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { FormSummary } from '@/components/forms/form-summary';
import { useFormFlowStore } from '@/lib/stores/form-flow-store';
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
    extractedData,
    missingFields,
    reviewSchema,
    pdfBlobUrl,
    setExtractedData,
    setMissingFields,
    setPdfBlobUrl,
    reset,
  } = useFormFlowStore();
  const [editableData, setEditableData] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(
    {}
  );
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setEditableData(extractedData ?? {});
  }, [extractedData]);

  const handleDownload = () => {
    if (pdfBlobUrl) {
      const a = document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = 'completed-form.pdf';
      a.click();
      toast.success('PDF downloaded');
    } else {
      toast.info('PDF generation not yet connected. This is a demo.');
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedFormType) {
      toast.error('No form type selected.');
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
        setValidationErrors(body.errors ?? {});
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

      setValidationErrors({});
      setExtractedData(validatedData);
      setMissingFields([]);
      setEditableData(validatedData);

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
    <div className="max-w-2xl space-y-6">
      <StepIndicator steps={steps} currentStep={3} />

      <div>
        <h2 className="text-lg font-semibold text-foreground">Form Review</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review the extracted information before downloading.
        </p>
      </div>

      <FormSummary
        schema={reviewSchema}
        data={data}
        missingFields={missingFields}
        errors={validationErrors}
        onChange={(key, value) => {
          setEditableData((prev) => ({ ...prev, [key]: value }));
        }}
      />

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
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
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
