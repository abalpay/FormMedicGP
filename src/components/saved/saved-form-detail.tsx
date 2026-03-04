'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { SavedFormMeta } from '@/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SavedFormDetailProps {
  form: SavedFormMeta;
}

export function SavedFormDetail({ form }: SavedFormDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/saved-forms/${form.id}?include=pdf`);
      if (!res.ok) throw new Error();
      const { pdfBase64 } = (await res.json()) as { pdfBase64: string };
      if (!pdfBase64) {
        toast.error('No PDF available for this form.');
        return;
      }
      const bytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const patientName = form.extractedData?.fullName || form.extractedData?.customerName;
      const patientDob = form.extractedData?.dateOfBirth;
      const filenameParts: string[] = [];
      if (form.formType) filenameParts.push(form.formType);
      if (typeof patientName === 'string' && patientName) filenameParts.push(patientName.replace(/\s+/g, '-'));
      if (typeof patientDob === 'string' && patientDob) filenameParts.push(patientDob);
      filenameParts.push(new Date(form.createdAt).toISOString().slice(0, 10));
      a.download = `${filenameParts.join('_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/saved-forms/${form.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Form deleted');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const dataEntries = Object.entries(form.extractedData).filter(
    ([, v]) => v != null && String(v).trim() !== ''
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
            <Download className="w-4 h-4 mr-1.5" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          {confirmDelete ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Form summary */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{form.formType}</Badge>
            <Badge variant="secondary">{form.status}</Badge>
          </div>
          <CardTitle className="text-lg font-[family-name:var(--font-display)]">
            {form.formName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(form.createdAt)}
          </p>
        </CardHeader>
      </Card>

      {/* Extracted data */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-base font-[family-name:var(--font-display)]">
            Extracted Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No extracted data available.</p>
          ) : (
            <div className="divide-y">
              {dataEntries.map(([key, value]) => (
                <div key={key} className="flex gap-4 py-2.5">
                  <span className="text-sm text-muted-foreground w-40 shrink-0 break-words">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </span>
                  <span className="text-sm text-foreground break-words min-w-0">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
