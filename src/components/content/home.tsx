"use client";
import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { Parallax, ParallaxLayer, IParallax } from "@react-spring/parallax";
import { FiArrowDown } from "react-icons/fi";
import { Boop } from "@/components/animations/boop";

const HomeContent = () => {
  const parallax = useRef<IParallax>(null);
  const [scrollPosition, setPosition] = useState(0);

  const updateScrollPosition = useCallback(() => {
    if (scrollPosition < 4) {
      return setPosition((state) => state + 1);
    }
    return setPosition(0);
  }, [scrollPosition]);

  const scroll = useCallback(() => {
    if (parallax.current) {
      parallax.current.scrollTo(scrollPosition + 1);
      updateScrollPosition();
    }
  }, [scrollPosition, updateScrollPosition]);
  return (
    <Parallax pages={5} ref={parallax} className="!touch-auto">
      <ParallaxLayer
        offset={0}
        speed={0.5}
        className="flex justify-center flex-col"
      >
        <p
          className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 block text-transparent bg-clip-text background-animate"
        >
          Hi, I&apos;m
        </p>
        <h1
          className="place-self-center text-center text-6xl lg:text-9xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text background-animate"
        >
          Chance Eakin
        </h1>
        <div className="place-self-center">
          <Boop>
            <button aria-label="scroll-down-page" onClick={scroll}>
              <svg width="0" height="0">
                <linearGradient
                  id="blue-gradient"
                  x1="100%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop stopColor="#7a6ded" offset="0%" />
                  <stop stopColor="#591885" offset="100%" />
                </linearGradient>
              </svg>
              <FiArrowDown
                size="3em"
                style={{
                  stroke: "url(#blue-gradient)",
                }}
              />
            </button>
          </Boop>
        </div>
      </ParallaxLayer>

      <ParallaxLayer
        offset={1}
        className="flex justify-center"
        onClick={scroll}
      >
        {/* <ParallaxLayer sticky={{ start: 1, end: 3 }}> */}
        <h2
          className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text"
        >
          I write software,
        </h2>
      </ParallaxLayer>

      <ParallaxLayer
        offset={2}
        speed={1.5}
        className="flex justify-center"
        onClick={scroll}
      >
        <p className={PARAGRAPH_CLASSES}>live in Austin,</p>
      </ParallaxLayer>

      <ParallaxLayer
        offset={3}
        speed={1.5}
        className="flex justify-center"
        onClick={scroll}
      >
        <p className={PARAGRAPH_CLASSES}>and love building and learning.</p>
      </ParallaxLayer>
      <ParallaxLayer offset={4} speed={1.5} className="flex justify-center">
        <h3 className={ABOUT_LINK_CLASSES}>
          <Link href="/about">Find out more.</Link>
        </h3>
      </ParallaxLayer>
    </Parallax>
  );
};

const PARAGRAPH_CLASSES = `place-self-center text-5xl text-center
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text leading-relaxed`;

const ABOUT_LINK_CLASSES = `place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text hover:from-pink-500 hover:to-yellow-500`;

export default HomeContent;
