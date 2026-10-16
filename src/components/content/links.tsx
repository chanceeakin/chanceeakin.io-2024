import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const LINKS = [
  { label: "Instagram", handle: "@chanceeakin", href: "https://www.instagram.com/chanceeakin/", icon: FaInstagram },
  { label: "LinkedIn", handle: "in/chanceeakin", href: "https://www.linkedin.com/in/chanceeakin/", icon: FaLinkedin },
  { label: "GitHub", handle: "chanceeakin", href: "https://github.com/chanceeakin/", icon: FaGithub },
];

export const LinksContent = () => (
  <div className="mx-auto max-w-6xl px-6 pt-16 md:pt-24">
    <p className="eyebrow mb-6">Elsewhere</p>
    <h1 className="display text-4xl sm:text-6xl">Links</h1>
    <div className="mt-12 grid border-t border-l border-sand sm:grid-cols-3">
      {LINKS.map(({ label, handle, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          className="group flex min-h-56 flex-col justify-between border-r border-b border-sand p-6 transition-colors hover:bg-rosewood hover:text-cream"
        >
          <Icon size="3em" aria-hidden />
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{label}</span>
            <span className="text-oak group-hover:text-taupe">{handle}</span>
          </div>
        </a>
      ))}
    </div>
  </div>
);
