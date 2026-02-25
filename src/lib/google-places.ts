import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

let configured = false;

/**
 * Loads the Google Places library. Returns `null` if no API key is set.
 */
export function loadPlaces(): Promise<google.maps.PlacesLibrary> | null {
  if (!apiKey) return null;
  if (!configured) {
    setOptions({ key: apiKey });
    configured = true;
  }
  return importLibrary('places');
}
