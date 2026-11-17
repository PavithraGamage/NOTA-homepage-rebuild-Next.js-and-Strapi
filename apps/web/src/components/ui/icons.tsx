/** Functional UI icons (not editorial content), drawn here rather than managed in the CMS. */

export function MenuIcon() {
  const dots = [4, 12, 20].flatMap((y) => [4, 12, 20].map((x) => ({ x, y })));
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {dots.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />
      ))}
    </svg>
  );
}

/** `bold` is the menu's close button (measured: ~17px cross, 2.5px stroke); the default is the popover's. */
export function CloseIcon({ bold = false }: { bold?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={bold ? 'M4.5 4.5l15 15M19.5 4.5l-15 15' : 'M5 5l14 14M19 5L5 19'}
        stroke="currentColor"
        strokeWidth={bold ? 2.4 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}
