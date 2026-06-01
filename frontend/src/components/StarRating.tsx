// Safety rating as filled/empty stars. Read-only.

export function StarRating({ value }: { value: number }) {
  return (
    <span className="text-amber-500" aria-label={`${value} of 5 safety stars`}>
      {'★'.repeat(value)}
      <span className="text-slate-300">{'★'.repeat(5 - value)}</span>
    </span>
  );
}
