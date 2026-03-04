'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SavedFormSummary } from '@/types';

const PER_PAGE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface SavedFormsListProps {
  initialForms: SavedFormSummary[];
  initialTotal: number;
  formTypes: string[];
}

export function SavedFormsList({ initialForms, initialTotal, formTypes }: SavedFormsListProps) {
  const [forms, setForms] = useState(initialForms);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFormType, setSelectedFormType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    if (!isInitialMount.current) {
      setPage(1);
    }
  }, [selectedFormType]);

  // Fetch forms when filters/page change
  const fetchForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedFormType && selectedFormType !== 'all') params.set('form_type', selectedFormType);
      params.set('page', String(page));
      params.set('per_page', String(PER_PAGE));

      const res = await fetch(`/api/saved-forms?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForms(data.forms);
      setTotal(data.total);
    } catch {
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedFormType, page]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchForms();
  }, [fetchForms]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or form name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedFormType} onValueChange={setSelectedFormType}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {formTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Forms list */}
      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/60 mb-4">
              <FileText className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch || selectedFormType !== 'all'
                ? 'No forms match your filters.'
                : 'No forms yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={isLoading ? 'opacity-60 transition-opacity' : ''}>
          <CardContent className="p-0">
            <div className="divide-y">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard/saved/${form.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <Badge variant="outline" className="text-xs shrink-0">
                    {form.formType}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    {form.patientName ? (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {form.patientName}
                          </p>
                          {form.patientDob && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              DOB: {formatDate(form.patientDob)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {form.formName}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-foreground truncate">
                        {form.formName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDate(form.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} form{total !== 1 ? 's' : ''} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
