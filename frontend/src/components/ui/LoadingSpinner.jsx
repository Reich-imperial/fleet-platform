export default function LoadingSpinner({ rows = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-input bg-[var(--color-line)]" />
      ))}
    </div>
  );
}
