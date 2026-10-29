type Props<T extends string> = { tabs: readonly T[]; value: T; onChange: (t: T) => void };

export default function Tabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t} className={t === value ? "active" : ""} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}
