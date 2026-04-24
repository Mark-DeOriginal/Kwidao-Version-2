export default function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-4xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--theme-primary)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-[clamp(26px,3.5vw,42px)] font-extrabold tracking-[-0.02em] text-[var(--theme-text-strong)] leading-[1.15]">
        {title}
      </h2>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.7] text-[var(--theme-text-soft)]">{description}</p>
    </div>
  );
}
