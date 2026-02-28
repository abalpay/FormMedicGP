'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Patient } from '@/types';

interface PatientSearchComboboxProps {
  onSelect: (patient: Patient) => void;
}

export function PatientSearchCombobox({ onSelect }: PatientSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/patients?search=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(data.patients ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (patient: Patient) => {
    setQuery(patient.customerName);
    setOpen(false);
    onSelect(patient);
  };

  const formatDob = (dob: string | null) => {
    if (!dob) return '';
    try {
      return new Date(dob).toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dob;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          placeholder="Search saved patients..."
          className="pl-9"
          autoComplete="off"
        />
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {loading ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              Searching...
            </li>
          ) : results.length === 0 ? (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              No patients found
            </li>
          ) : (
            results.map((patient) => (
              <li
                key={patient.id}
                className={cn(
                  'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                  'hover:bg-accent hover:text-accent-foreground'
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(patient);
                }}
              >
                <span className="font-medium">{patient.customerName}</span>
                {patient.dateOfBirth && (
                  <span className="text-muted-foreground ml-2">
                    DOB: {formatDob(patient.dateOfBirth)}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
