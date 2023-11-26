"use client";
import Link from "next/link";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import { FiArrowDown } from "react-icons/fi";
import { Boop } from "@/components/Boop";

export default function Home() {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      <div className="h-full w-full grid text-white">
        <Parallax pages={5}>
          <ParallaxLayer
            offset={0}
            speed={0.5}
            className="flex justify-center flex-col"
          >
            <p
              className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 block text-transparent bg-clip-text"
            >
              Hi, I&apos;m
            </p>
            <h1
              className="place-self-center text-9xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text"
            >
              Chance Eakin
            </h1>
            <div className="place-self-center">
              <Boop>
                <FiArrowDown size="3em" />
              </Boop>
            </div>
          </ParallaxLayer>

          <ParallaxLayer offset={1} className="flex justify-center">
            {/* <ParallaxLayer sticky={{ start: 1, end: 3 }}> */}
            <h2
              className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text"
            >
              I write software,
            </h2>
          </ParallaxLayer>

          <ParallaxLayer offset={2} speed={1.5} className="flex justify-center">
            <p
              className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text"
            >
              live life in the real world,
            </p>
          </ParallaxLayer>

          <ParallaxLayer offset={3} speed={1.5} className="flex justify-center">
            <p
              className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text"
            >
              and do my part to make the world a better place.
            </p>
          </ParallaxLayer>
          <ParallaxLayer offset={4} speed={1.5} className="flex justify-center">
            <h3
              className="place-self-center text-5xl
      bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text hover:from-pink-500 hover:to-yellow-500"
            >
              <Link href="/about">Find out more.</Link>
            </h3>
          </ParallaxLayer>
        </Parallax>
      </div>
    </div>
  );
}
