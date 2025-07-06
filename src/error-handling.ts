import * as Sentry from '@sentry/browser'

const messagesToIgnore = [
  // internal
  'JWT expired',
  'Loading CSS chunk', // webpack
  'Failed to fetch dynamically imported module', // esbuild
  // 3rd party dep
  "Unable to get property 'set' of undefined or null reference", // supabase SDK
  // no idea what it is
  'internal',
  'Unexpected token <', // trying to load static asset (js/css) but it returns html instead
  'The object can not be found here',
  // weird browsers/extensions
  'Network request failed',
  'Network Error',
  'NotAllowedError: The play method is not allowed by the user agent.', // playing pedestal vids
  'setSource is not a function',
  'AbortError: The fetching process for the media resource was aborted by the user agent',
  'AbortError: The transaction was aborted, so the request cannot be fulfilled.',
  'SecurityError: The operation is insecure.',
  'window.ethereum',
  'deadline-exceeded',
  "Can't find variable: setIOSParameters",
]

export function handleError(err: unknown): void {
  if (
    err &&
    (err as Error).message &&
    messagesToIgnore.filter((messageToIgnore) =>
      (err as Error).message
        .toLowerCase()
        .includes(messageToIgnore.toLowerCase())
    ).length
  ) {
    return
  }
  Sentry.captureException(err)
}
