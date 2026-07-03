type CursorIconProps = {
  size?: number;
  className?: string;
};

/** Cursor brand mark (from cursor.com/brand/logo.svg), simplified for small sizes. */
export function CursorIcon({ size = 18, className }: CursorIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M22.842 1.387a.83.83 0 0 1 1.288.744l-1.497 23.335a.622.622 0 0 1-1.117.336l-6.505-8.562a1.04 1.04 0 0 0-.695-.402L3.648 15.486a.622.622 0 0 1-.267-1.135z"
      />
    </svg>
  );
}
