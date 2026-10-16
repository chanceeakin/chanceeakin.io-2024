import Link from "next/link";

const SECTIONS = [
  {
    n: "01",
    title: "Work",
    body: "I'm a software engineer with close to a decade of experience across a wide variety of industries and architectural concerns. My software supports robotics, financial transactions, animations across the internet, and skyscrapers.",
  },
  {
    n: "02",
    title: "Life",
    body: "In addition to software, I stay active with my hobbies and my family. Krav maga, fly fishing, cloud architecture, and wine are my current pursuits. My wife and I love to travel--Colorado holds a special place in our hearts.",
  },
  {
    n: "03",
    title: "Study",
    body: "My formal education is in music: I hold a doctorate (DMA) from UT Austin, where my research was in performance psychology as it applied to vocal pedagogy, Schubert, and Mozart. Other degrees: MM Voice - University of Cincinnati, and BM Voice, cum laude, Baylor University.",
  },
];

export const AboutContent = () => (
  <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
    <p className="eyebrow mb-6">About</p>
    <h1 className="display max-w-3xl text-4xl sm:text-6xl">
      Engineer, musician, <span className="text-teak">maker.</span>
    </h1>
    <div className="mt-16 border-t border-sand">
      {SECTIONS.map((s) => (
        <section
          key={s.n}
          className="grid gap-4 border-b border-sand py-10 md:grid-cols-[8rem_12rem_1fr]"
        >
          <span className="font-hand text-3xl text-teak">{s.n}</span>
          <h2 className="display text-2xl">{s.title}</h2>
          <p className="max-w-xl text-walnut">{s.body}</p>
        </section>
      ))}
    </div>
    <Link
      href="/links"
      className="mt-10 inline-block rounded-full bg-rosewood px-6 py-2 text-sm text-cream transition-colors hover:bg-teak"
    >
      Pertinent links →
    </Link>
  </div>
);
