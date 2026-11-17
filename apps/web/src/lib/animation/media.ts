/**
 * Cinematic mode: large screens without a reduced-motion preference get the pinned, scrubbed
 * scenes. Everyone else keeps the static layouts (the reference ignores the setting; we don't).
 * The same query gates the tall scene wrappers in CSS, so layout never depends on JS.
 */
export const CINEMATIC = '(min-width: 992px) and (prefers-reduced-motion: no-preference)';

/** The hero sequence's scroll length (viewport heights); the header hides once it is over. */
export const HERO_SEQUENCE = 1.7;
