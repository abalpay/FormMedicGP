'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatPatientDob } from '@/lib/patient-mappers';
import { toast } from 'sonner';
import {
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Users,
  Loader2,
} from 'lucide-react';
import type { PatientListItem } from '@/types';

const PatientEditDialog = dynamic(
  () =>
    import('@/components/patients/patient-edit-dialog').then((module) => ({
      default: module.PatientEditDialog,
    })),
  { ssr: false }
);

const DEFAULT_LIMIT = 25;

interface PatientListResponse {
  patients?: PatientListItem[];
  nextCursor?: string | null;
}

interface PatientListProps {
  initialPatients?: PatientListItem[];
  initialNextCursor?: string | null;
}

export function PatientList({
  initialPatients,
  initialNextCursor,
}: PatientListProps) {
  const hasInitialSnapshot = initialPatients !== undefined;
  const [patients, setPatients] = useState<PatientListItem[]>(
    initialPatients ?? []
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor ?? null
  );
  const [loadingInitial, setLoadingInitial] = useState(!hasInitialSnapshot);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const patientsCountRef = useRef((initialPatients ?? []).length);

  const activeSearch = useMemo(() => search.trim(), [search]);

  useEffect(() => {
    patientsCountRef.current = patients.length;
  }, [patients.length]);

  const fetchPatients = useCallback(
    async ({
      searchQuery,
      cursor,
      append,
      showInitialLoader,
    }: {
      searchQuery: string;
      cursor?: string | null;
      append?: boolean;
      showInitialLoader?: boolean;
    }) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      if (append) {
        setIsFetchingMore(true);
      } else if (showInitialLoader) {
        setLoadingInitial(true);
      } else {
        setIsRefreshing(true);
      }
      setError(false);

      try {
        const params = new URLSearchParams();
        params.set('limit', String(DEFAULT_LIMIT));
        if (searchQuery) {
          params.set('search', searchQuery);
        }
        if (cursor) {
          params.set('cursor', cursor);
        }

        const res = await fetch(`/api/patients?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('request_failed');
        }

        const data = (await res.json()) as PatientListResponse;
        const pagePatients = data.patients ?? [];
        const upcomingCursor = data.nextCursor ?? null;

        if (append) {
          setPatients((prev) => [...prev, ...pagePatients]);
        } else {
          setPatients(pagePatients);
        }
        setNextCursor(upcomingCursor);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        if (patientsCountRef.current > 0 && !append) {
          toast.error('Failed to refresh patients');
        } else if (patientsCountRef.current === 0) {
          setError(true);
        }
      } finally {
        if (append) {
          setIsFetchingMore(false);
        }
        setLoadingInitial(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (hasInitialSnapshot) {
      fetchPatients({
        searchQuery: '',
      });
    } else {
      fetchPatients({
        searchQuery: '',
        showInitialLoader: true,
      });
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchPatients, hasInitialSnapshot]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchPatients({ searchQuery: value.trim() });
    }, 250);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Patient deleted');
      setPatients((prev) => prev.filter((patient) => patient.id !== id));
      if (confirmDeleteId === id) {
        setConfirmDeleteId(null);
      }
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (loadingInitial) {
    return (
      <div className="space-y-3" data-testid="patients-loading">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-3" data-testid="patients-error">
        <p className="text-sm text-muted-foreground">Failed to load patients.</p>
        <Button
          variant="outline"
          onClick={() =>
            fetchPatients({
              searchQuery: activeSearch,
              showInitialLoader: patients.length === 0,
            })
          }
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="patients-list">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {isRefreshing && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Input
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search patients..."
          className={cn('pl-9', isRefreshing && 'pr-9')}
          data-testid="patients-search"
        />
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 space-y-2" data-testid="patients-empty">
          <Users className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {search
              ? 'No patients match your search.'
              : 'No saved patients yet. Save a patient from the form wizard.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-testid="patients-items">
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{patient.customerName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                    {patient.dateOfBirth && (
                      <span>DOB: {formatPatientDob(patient.dateOfBirth)}</span>
                    )}
                    {patient.address && (
                      <span className="truncate max-w-[200px]">{patient.address}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {confirmDeleteId === patient.id ? (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPatientId(patient.id)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDeleteId(patient.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              fetchPatients({
                searchQuery: activeSearch,
                cursor: nextCursor,
                append: true,
              })
            }
            disabled={isFetchingMore}
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {editingPatientId && (
        <PatientEditDialog
          patientId={editingPatientId}
          open={editingPatientId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPatientId(null);
            }
          }}
          onUpdated={() =>
            fetchPatients({
              searchQuery: activeSearch,
              showInitialLoader: patients.length === 0,
            })
          }
        />
      )}
    </div>
  );
}
