import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-sand">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-8 text-sm text-oak sm:flex-row">
        <span>© {new Date().getFullYear()} Chance Eakin — made in Austin.</span>
        <Link href="/links" className="hover:text-teak">
          Find me elsewhere →
        </Link>
      </div>
    </footer>
  );
}
