"use client";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { Boop } from "@/components/animations/boop";

export const LinksContent = () => {
  return (
    <div className="flex justify-center flex-col">
      <h1
        className="place-self-center text-6xl lg:text-9xl
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text background-animate"
      >
        Links
      </h1>
      <div className="w-full flex justify-center">
        <Boop className="p-5">
          <svg width="0" height="0">
            <linearGradient
              id="orange-gradient"
              x1="100%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop stopColor="#ec4899" offset="0%" />
              <stop stopColor="#f97316" offset="100%" />
            </linearGradient>
          </svg>
          <FaInstagram
            size="3em"
            style={{
              fill: "url(#orange-gradient)",
            }}
          />
        </Boop>
        <Boop className="p-5">
          <FaLinkedin
            size="3em"
            style={{
              fill: "url(#orange-gradient)",
            }}
          />
        </Boop>
        <Boop className="p-5">
          <FaGithub
            size="3em"
            style={{
              fill: "url(#orange-gradient)",
            }}
          />
        </Boop>
      </div>
    </div>
  );
};
