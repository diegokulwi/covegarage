import Link from "next/link";

export interface Crumb {
  label: string;
  href: string;
}

// Miga de pan compartida: barra oscura fija bajo el header, igual en toda
// la web, más el marcado BreadcrumbList (Schema.org) para Google.
export default function Breadcrumb({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `https://covegarage.com${item.href}`,
    })),
  };

  return (
    <nav aria-label="Miga de pan" className="bg-dark-950 border-b border-dark-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={item.href} className="flex items-center gap-2 shrink-0">
              {i > 0 && <span className="text-slate-700">/</span>}
              {isLast ? (
                <span className="text-slate-300 font-medium truncate max-w-[60vw]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[#7DC832] transition-colors">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
