export default function StatusBadge({ state, children }) {
  return (
    <span className={`status ${state}`}>
      <span className="status-dot" aria-hidden="true" />
      {children}
    </span>
  );
}
