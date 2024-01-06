"use client";
import React, { useEffect, useState } from "react";
import { useSpring, animated } from "react-spring";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Burger = () => {
  const pathname = usePathname();
  const [isOpen, toggle] = useState(false);

  const first = useSpring({
    transform: isOpen
      ? "translate(5px, 32px) rotate(-45deg)"
      : "translate(2px, 7px) rotate(0deg)",
  });
  const second = useSpring({
    transform: isOpen
      ? "translate(10px, 4px) rotate(45deg)"
      : "translate(2px, 19px) rotate(0deg)",
  });
  const third = useSpring({
    transform: isOpen
      ? "translate(5px, 32px) rotate(-45deg)"
      : "translate(2px, 31px) rotate(0deg)",
  });
  const menuAppear = useSpring({
    transform: isOpen ? "translate3D(0,0,0)" : "translate3D(0,-40px,0)",
    opacity: isOpen ? 1 : 0,
  });

  useEffect(() => {
    toggle(false);
  }, [pathname]);

  return (
    <div className="m-5 z-50 absolute top-0 left-0">
      <button
        aria-label="nav-dropdown"
        onClick={() => toggle(!isOpen)}
        tabIndex={0}
        className="hover:cursor-pointer"
      >
        <svg
          width="40"
          height="32"
          viewBox="0 0 44 44"
          fill="#fafafa"
          xmlns="http://www.w3.org/2000/svg"
        >
          <animated.rect width="40" height="4" rx="2" style={first} />
          <animated.rect width="40" height="4" rx="2" style={second} />
          <animated.rect width="40" height="4" rx="2" style={third} />
        </svg>
      </button>
      <animated.div style={menuAppear}>
        {isOpen ? <RadioContent /> : null}
      </animated.div>
    </div>
  );
};

const RadioContent = () => {
  return (
    <div className="flex flex-col text-white border border-gray-300 md:border-none bg-gray-900 md:bg-transparent p-4 md:p-0">
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/links">Links</Link>
      <Link href="/blog">Blog</Link>
    </div>
  );
};

export default Burger;
