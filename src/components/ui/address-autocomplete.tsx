'use client';

import { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { loadPlaces } from '@/lib/google-places';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  id,
  value,
  onChange,
  onBlur,
  placeholder = '123 Main St, Sydney NSW 2000',
  className,
  disabled,
}: AddressAutocompleteProps) {
  const [apiReady, setApiReady] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const promise = loadPlaces();
    if (!promise) return;
    promise.then(() => setApiReady(true));
  }, []);

  if (!apiReady) {
    return (
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        autoComplete="off"
      />
    );
  }

  return (
    <AutocompleteInput
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      wrapperRef={wrapperRef}
    />
  );
}

/* Inner component — only rendered once the Places API is loaded */
function AutocompleteInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
  wrapperRef,
}: AddressAutocompleteProps & { wrapperRef: React.RefObject<HTMLDivElement | null> }) {
  const {
    ready,
    suggestions: { status, data },
    setValue: setQuery,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'au' },
      types: ['address'],
    },
    debounce: 300,
    defaultValue: value,
  });

  const [open, setOpen] = useState(false);

  // Sync external value into the hook when it changes externally
  const prevValue = useRef(value);
  useEffect(() => {
    if (value !== prevValue.current) {
      setQuery(value, false);
      prevValue.current = value;
    }
  }, [value, setQuery]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setQuery(val);
    setOpen(true);
    prevValue.current = val;
  };

  const handleSelect = (description: string) => {
    setQuery(description, false);
    clearSuggestions();
    setOpen(false);

    // Strip trailing ", Australia" so address stays compatible with reidentify()
    const formatted = description.replace(/, Australia$/, '');
    onChange(formatted);
    prevValue.current = formatted;
  };

  const showDropdown = open && status === 'OK' && data.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={handleInput}
        onFocus={() => data.length > 0 && setOpen(true)}
        onBlur={() => {
          // Delay to allow mousedown on suggestions to fire first
          setTimeout(() => {
            setOpen(false);
            onBlur?.();
          }, 150);
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled || !ready}
        autoComplete="off"
      />
      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {data.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className={cn(
                'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                'hover:bg-accent hover:text-accent-foreground',
              )}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before select
                handleSelect(suggestion.description);
              }}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
