'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { fillPdfFromBytes } from '@/lib/pdf-fill-core';
import { getFormSchema } from '@/lib/schemas';
import type { FormSchema, ExtractedFormData } from '@/types';

interface UsePdfPreviewOptions {
  formType: string | null;
  editableData: Record<string, unknown>;
  enabled?: boolean;
}

interface UsePdfPreviewReturn {
  previewUrl: string | null;
  isGenerating: boolean;
}

export function usePdfPreview({
  formType,
  editableData,
  enabled = true,
}: UsePdfPreviewOptions): UsePdfPreviewReturn {
  const [templateBytes, setTemplateBytes] = useState<Uint8Array | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const schema = useMemo(
    () => (formType ? getFormSchema(formType) : null),
    [formType]
  );

  // Fetch template once on mount / formType change
  useEffect(() => {
    if (!formType || !enabled) return;

    let cancelled = false;
    setTemplateBytes(null);

    async function fetchTemplate() {
      try {
        const res = await fetch(`/api/form-template/${formType}`);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        if (!cancelled) {
          setTemplateBytes(new Uint8Array(buf));
        }
      } catch {
        // Template fetch failed — preview won't be available
      }
    }

    fetchTemplate();
    return () => {
      cancelled = true;
    };
  }, [formType, enabled]);

  // Generate preview whenever template or data changes
  useEffect(() => {
    if (!enabled || !templateBytes || !schema) return;

    const data = editableData as ExtractedFormData;

    let cancelled = false;
    setIsGenerating(true);

    const schedule =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 0);

    schedule(async () => {
      try {
        const pdfBytes = await fillPdfFromBytes(templateBytes, schema, data);
        if (cancelled) return;

        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        // Fill failed — keep previous preview
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [templateBytes, schema, editableData, enabled]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return { previewUrl, isGenerating };
}
