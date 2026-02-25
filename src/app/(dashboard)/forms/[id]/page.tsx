'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, FilePlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/ui/step-indicator';
import { FormSummary } from '@/components/forms/form-summary';
import { MissingFieldPrompts } from '@/components/forms/missing-field-prompts';
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
  const { extractedData, pdfBlobUrl, reset } = useFormFlowStore();

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

  const handleNewForm = () => {
    reset();
    router.push('/forms/new');
  };

  const handleMissingFieldsSubmit = (answers: Record<string, string>) => {
    // TODO: Re-call /api/process-form with supplementary data
    console.log('Missing field answers:', answers);
    toast.info('Re-processing not yet implemented');
  };

  const data = extractedData ?? {
    diagnosis: 'Demo — complete the backend pipeline to see real data',
  };
  const missingFields = (extractedData?.missingFields as string[]) ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <StepIndicator steps={steps} currentStep={3} />

      <div>
        <h2 className="text-lg font-semibold text-foreground">Form Review</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review the extracted information before downloading.
        </p>
      </div>

      <FormSummary data={data} missingFields={missingFields} />

      {missingFields.length > 0 && (
        <MissingFieldPrompts
          missingFields={missingFields}
          onSubmit={handleMissingFieldsSubmit}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" asChild>
          <Link href="/dictate">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dictation
          </Link>
        </Button>
        <div className="flex items-center gap-3">
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
