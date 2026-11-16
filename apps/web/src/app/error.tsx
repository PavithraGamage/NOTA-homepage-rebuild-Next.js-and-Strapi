'use client';

/**
 * Shown when content cannot be loaded and no cached copy exists (e.g. Strapi down on a
 * cold start). The server still responds with a 5xx, so monitors see the failure.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main role="alert">
      <h1>We&rsquo;ll be right back</h1>
      <p>This page is temporarily unavailable.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
