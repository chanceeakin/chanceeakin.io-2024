"use client";
import Link from "next/link";
import { useRef, useCallback, useState } from "react";
import { Parallax, ParallaxLayer, IParallax } from "@react-spring/parallax";
import { FiArrowRight } from "react-icons/fi";
import { Boop } from "@/components/animations/boop";

export const AboutContent = () => {
  const parallax = useRef<IParallax>(null);
  const [scrollPosition, setPosition] = useState(0);

  const updateScrollPosition = useCallback(() => {
    if (scrollPosition < 6) {
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
    <Parallax pages={7} ref={parallax} horizontal>
      <ParallaxLayer
        offset={0}
        speed={1.5}
        className="flex justify-center flex-col"
      >
        <h1
          className="place-self-center text-9xl
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text background-animate"
        >
          <Link href="/">About</Link>
        </h1>
        <div className="place-self-center">
          <Boop>
            <button onClick={scroll}>
              <svg width="0" height="0">
                <linearGradient
                  id="blue-gradient"
                  x1="100%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop stopColor="#ec4899" offset="0%" />
                  <stop stopColor="#f97316" offset="100%" />
                </linearGradient>
              </svg>
              <FiArrowRight
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
        speed={1.5}
        className="flex justify-center"
        sticky={{
          start: 1,
          end: 3,
        }}
      >
        <p
          className="place-self-start p-10 text-xl
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text"
        >
          I'm a software engineer with close to a decade of experience across a
          wide variety of industries and architectural concerns. My software
          supports robotics, financial transactions, animations across the
          internet, and skyscrapers.
        </p>
      </ParallaxLayer>
      <ParallaxLayer
        offset={2}
        speed={1.5}
        className="flex justify-center"
        sticky={{ start: 2, end: 4 }}
      >
        <p
          className="place-self-center text-xl p-10
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text"
        >
          In addition to my software pursuits, I pursue a myriad of interests.
          Lately, my interests are krav maga, fly fishing, cloud solutions via
          Amazon Web Services, and wine. This list changes often.
        </p>
      </ParallaxLayer>
      <ParallaxLayer
        offset={2}
        speed={1.5}
        className="flex justify-center"
        sticky={{ start: 3, end: 5 }}
      >
        <p
          className="place-self-end text-xl p-10
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text"
        >
          My formal education is in music: I hold a doctorate (DMA) from UT
          Austin, where my research was in performance psychology as it applied
          to vocal pedagogy, Schubert, and Mozart. Other degrees: MM Voice -
          University of Cincinnati, and BM Voice, cum laude, Baylor University.
        </p>
      </ParallaxLayer>
    </Parallax>
  );
};
