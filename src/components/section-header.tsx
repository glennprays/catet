import type { ReactNode } from "react";

/** Screen-section heading: title, optional caption, optional action. */
export function SectionHeader({
  title,
  caption,
  action,
  as = "h2",
}: {
  title: string;
  caption?: string;
  action?: ReactNode;
  as?: "h2" | "h3";
}) {
  const Heading = as;
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <Heading className="text-figure-md font-semibold text-ink">{title}</Heading>
        {caption !== undefined ? (
          <p className="text-meta text-muted-foreground">{caption}</p>
        ) : null}
      </div>
      {action !== undefined ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
