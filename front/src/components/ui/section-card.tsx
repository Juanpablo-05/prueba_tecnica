import Link from "next/link";

type SectionCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

export function SectionCard({
  title,
  description,
  href,
  cta,
}: SectionCardProps) {
  return (
    <article className="glass-panel rounded-[28px] p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="space-y-3">
        <p className="section-label">Modulo</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <Link
        href={href}
        className="mt-6 inline-flex rounded-full border border-slate-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
      >
        {cta}
      </Link>
    </article>
  );
}
