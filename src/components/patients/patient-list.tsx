'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PatientEditDialog } from '@/components/patients/patient-edit-dialog';
import { formatPatientDob } from '@/lib/patient-mappers';
import { toast } from 'sonner';
import { Pencil, Trash2, Search, RefreshCw, Users } from 'lucide-react';
import type { Patient } from '@/types';

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPatients = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError(false);
    try {
      const url = searchQuery
        ? `/api/patients?search=${encodeURIComponent(searchQuery)}`
        : '/api/patients';
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPatients(data.patients ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPatients(value.trim());
    }, 300);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Patient deleted');
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete patient');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
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
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-muted-foreground">
          Failed to load patients.
        </p>
        <Button variant="outline" onClick={() => fetchPatients(search.trim())}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search patients..."
          className="pl-9"
        />
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Users className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {search
              ? 'No patients match your search.'
              : 'No saved patients yet. Save a patient from the form wizard.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {patient.customerName}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                    {patient.dateOfBirth && (
                      <span>DOB: {formatPatientDob(patient.dateOfBirth)}</span>
                    )}
                    {patient.address && (
                      <span className="truncate max-w-[200px]">
                        {patient.address}
                      </span>
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
                        onClick={() => setEditingPatient(patient)}
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

      <PatientEditDialog
        patient={editingPatient}
        open={editingPatient !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPatient(null);
        }}
        onUpdated={() => fetchPatients(search.trim())}
      />
    </div>
  );
}
