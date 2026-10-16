import Link from "next/link";
import { Arc, Lamp, Shelf, Starburst } from "@/components/glyphs";

const CELLS = [
  {
    title: "Software",
    note: "Robotics, payments, animation, skyscrapers",
    glyph: <Shelf className="h-24 w-24" />,
    span: "sm:col-span-2",
    href: "/about",
  },
  {
    title: "Austin",
    note: "Home base",
    glyph: <Lamp className="h-24 w-24" />,
    span: "",
    href: "/about",
  },
  {
    title: "Music",
    note: "DMA, vocal performance",
    glyph: <Arc className="h-24 w-24" />,
    span: "",
    href: "/about",
  },
  {
    title: "Writing",
    note: "Notes from the workshop",
    glyph: <Starburst className="h-24 w-24" />,
    span: "sm:col-span-2",
    href: "/blog",
  },
  {
    title: "Fly fishing",
    note: "Colorado, ideally",
    glyph: <Arc className="h-24 w-24 -scale-y-100" />,
    span: "sm:col-span-2",
    href: "/about",
  },
];

const HomeContent = () => (
  <div className="page-enter">
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24">
      <p className="eyebrow mb-6">Software engineer — Austin, Texas</p>
      <h1 className="display max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
        Hi, I&apos;m Chance Eakin.
        <br />
        <span className="text-teak">I write software, built to last.</span>
      </h1>
      <div className="mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-sm text-walnut">
          Close to a decade of building across industries and architectures —
          and still loving the building and the learning.
        </p>
        <span className="font-hand text-2xl text-teak -rotate-3">
          hover a drawing — it opens up ↓
        </span>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-1 border-t border-l border-sand sm:grid-cols-4">
        {CELLS.map((cell) => (
          <Link
            key={cell.title}
            href={cell.href}
            className={`group flex min-h-56 flex-col justify-between border-r border-b border-sand p-6 transition-colors hover:bg-cream-deep ${cell.span}`}
          >
            <div className="flex justify-center text-rosewood transition-transform duration-500 group-hover:scale-105 group-hover:text-teak">
              {cell.glyph}
            </div>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium">{cell.title}</span>
              <span className="text-right text-oak">{cell.note}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>

    <section className="mt-24 bg-rosewood text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
        <h2 className="display text-3xl sm:text-5xl">
          Made with intent,
          <br />
          <span className="text-taupe">from the ground up.</span>
        </h2>
        <div className="flex flex-col gap-6 text-sand">
          <p>
            I live in Austin, build things for the web and beyond, and hold a
            doctorate in music — a background that still shapes how I think
            about craft, practice, and performance.
          </p>
          <Link
            href="/about"
            className="w-fit rounded-full border border-taupe px-6 py-2 text-sm text-cream transition-colors hover:bg-cream hover:text-rosewood"
          >
            Find out more →
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default HomeContent;
