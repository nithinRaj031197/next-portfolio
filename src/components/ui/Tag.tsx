export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded border border-line bg-graphite/60 px-2.5 py-1 font-mono text-xs text-mist transition-colors duration-200 hover:border-mist/50 hover:text-silver">
      {children}
    </li>
  );
}

export function TagList({ items, label }: { items: string[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </ul>
  );
}
