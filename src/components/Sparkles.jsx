/**
 * Sparkles — floating star particles, only visible in dark mode.
 * Usage: <Sparkles count={12} />
 */
export default function Sparkles({ count = 14 }) {
  return (
    <div className="sparkles-layer" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="sparkle" style={{ '--i': i }} />
      ))}
    </div>
  );
}
