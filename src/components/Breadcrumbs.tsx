import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function Breadcrumbs({ trail }: { trail: BreadcrumbItem[] }) {
  if (trail.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {trail.map((item, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="breadcrumbs-item">
              {item.href && !isLast ? (
                <Link href={item.href}>{item.name}</Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.name}</span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="breadcrumbs-sep">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <ThemeToggle />
    </nav>
  );
}
