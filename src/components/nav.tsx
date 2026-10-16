"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/links", label: "Links" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  // Menu closes itself when the route changes.
  const isOpen = openAt === pathname;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Home">
          <span className="grid h-8 w-8 place-items-center rounded-[4px] bg-rosewood text-[0.7rem] font-medium tracking-wider text-cream">
            CE
          </span>
          <span className="text-sm uppercase tracking-[0.18em]">
            Chance Eakin
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`text-sm transition-colors hover:text-teak ${
                isActive(href)
                  ? "text-espresso underline decoration-teak decoration-2 underline-offset-8"
                  : "text-walnut"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setOpenAt(isOpen ? null : pathname)}
          className="rounded-full border border-taupe px-4 py-1.5 text-sm md:hidden"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>

      {isOpen && (
        <nav
          className="border-t border-sand bg-cream px-6 py-2 md:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block border-b border-sand py-3 text-lg last:border-0 ${
                isActive(href) ? "text-teak" : "text-rosewood"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
