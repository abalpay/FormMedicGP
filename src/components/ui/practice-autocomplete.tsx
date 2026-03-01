'use client';

import { useEffect, useRef, useState } from 'react';
import usePlacesAutocomplete, { getGeocode } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { loadPlaces } from '@/lib/google-places';
import { sortPracticeSuggestions } from '@/lib/practice-suggestion-ranking';
import { cn } from '@/lib/utils';

interface PracticeAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PracticeAutocomplete({
  id,
  value,
  onChange,
  onAddressSelect,
  onBlur,
  placeholder = 'Sunrise Medical Centre',
  className,
  disabled,
}: PracticeAutocompleteProps) {
  const [apiReady, setApiReady] = useState(false);

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
        autoComplete="organization"
      />
    );
  }

  return (
    <AutocompleteInput
      id={id}
      value={value}
      onChange={onChange}
      onAddressSelect={onAddressSelect}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
}

function AutocompleteInput({
  id,
  value,
  onChange,
  onAddressSelect,
  onBlur,
  placeholder,
  className,
  disabled,
}: PracticeAutocompleteProps) {
  const {
    ready,
    suggestions: { status, data },
    setValue: setQuery,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'au' },
    },
    debounce: 300,
    defaultValue: value,
  });

  const [open, setOpen] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setQuery(value, false);
      prevValue.current = value;
    }
  }, [value, setQuery]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    onChange(nextValue);
    setQuery(nextValue);
    setOpen(true);
    prevValue.current = nextValue;
  };

  const handleSelect = async (
    suggestion: (typeof data)[number]
  ): Promise<void> => {
    const practiceName =
      suggestion.structured_formatting?.main_text ??
      suggestion.description.split(',')[0]?.trim() ??
      suggestion.description;

    setQuery(practiceName, false);
    clearSuggestions();
    setOpen(false);

    onChange(practiceName);
    prevValue.current = practiceName;

    if (!onAddressSelect) return;

    try {
      const geocodeResults = await getGeocode({ placeId: suggestion.place_id });
      const formattedAddress = geocodeResults[0]?.formatted_address
        ?.replace(/, Australia$/, '')
        .trim();

      if (formattedAddress) {
        onAddressSelect(formattedAddress);
      }
    } catch (error) {
      console.error('[practice-autocomplete] failed to load place details', error);
    }
  };

  const rankedSuggestions = sortPracticeSuggestions(data);
  const showDropdown = open && status === 'OK' && rankedSuggestions.length > 0;

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={handleInput}
        onFocus={() => data.length > 0 && setOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            onBlur?.();
          }, 150);
        }}
        placeholder={placeholder}
        className={className}
        disabled={disabled || !ready}
        autoComplete="organization"
      />
      {showDropdown && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
          {rankedSuggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className={cn(
                'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
                'hover:bg-accent hover:text-accent-foreground'
              )}
              onMouseDown={(event) => {
                event.preventDefault();
                void handleSelect(suggestion);
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
