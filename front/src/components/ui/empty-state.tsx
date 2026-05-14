type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-panel rounded-[28px] border-dashed p-8 text-center">
      <p className="section-label">Sin resultados</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 mx-auto max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
