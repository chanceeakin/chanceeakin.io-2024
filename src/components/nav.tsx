"use client";
import React, { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
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
  const [isOpen, toggle] = useState(false);

  const hamburgerFirst = useSpring({
    transform: isOpen
      ? "translate(5px, 32px) rotate(-45deg)"
      : "translate(2px, 7px) rotate(0deg)",
  });
  const hamburgerSecond = useSpring({
    transform: isOpen
      ? "translate(10px, 4px) rotate(45deg)"
      : "translate(2px, 19px) rotate(0deg)",
  });
  const hamburgerThird = useSpring({
    transform: isOpen
      ? "translate(5px, 32px) rotate(-45deg)"
      : "translate(2px, 31px) rotate(0deg)",
  });

  const menuSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0px)" : "translateY(-8px)",
    config: { tension: 300, friction: 22 },
  });

  useEffect(() => {
    toggle(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3">
      {/* Logo */}
      <Link
        href="/"
        className="text-white/90 font-semibold text-xl tracking-wider hover:text-purple-400 transition-colors duration-200"
      >
        CE
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
              isActive(href)
                ? "text-purple-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile burger */}
      <div className="md:hidden relative">
        <button
          aria-label="toggle navigation menu"
          onClick={() => toggle(!isOpen)}
          className="hover:cursor-pointer focus:outline-none"
        >
          <svg
            width="32"
            height="28"
            viewBox="0 0 44 44"
            fill="#fafafa"
            xmlns="http://www.w3.org/2000/svg"
          >
            <animated.rect width="40" height="4" rx="2" style={hamburgerFirst} />
            <animated.rect
              width="40"
              height="4"
              rx="2"
              style={hamburgerSecond}
            />
            <animated.rect width="40" height="4" rx="2" style={hamburgerThird} />
          </svg>
        </button>

        <animated.div
          style={{ ...menuSpring, pointerEvents: isOpen ? "auto" : "none" }}
          className="absolute right-0 top-11 w-44 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-5 py-3 text-sm font-medium transition-colors duration-150 hover:bg-white/10 ${
                isActive(href) ? "text-purple-400" : "text-white/80"
              }`}
            >
              {label}
            </Link>
          ))}
        </animated.div>
      </div>
    </header>
  );
}
