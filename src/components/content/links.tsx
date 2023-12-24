"use client";
import { useEffect, useState } from "react";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { Boop } from "@/components/animations/boop";
import { EntryTrailAnimation } from "@/components/animations/entry";
import Link from "next/link";

export const LinksContent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const INSTAGRAM_LINK = `https://www.instagram.com/chanceeakin/`;
  const LINKEDIN_LINK = `https://www.linkedin.com/in/chanceeakin/`;
  const GITHUB_LINK = `https://github.com/chanceeakin/`;

  return (
    <div className="flex justify-center flex-col">
      <h1
        className="place-self-center text-6xl lg:text-9xl
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text background-animate"
      >
        Links
      </h1>
      <div className="w-full flex justify-center">
        <EntryTrailAnimation
          items={[
            <Boop key={1} className="p-5">
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
              <Link href={INSTAGRAM_LINK}>
                <FaInstagram
                  size="3em"
                  style={{
                    fill: "url(#orange-gradient)",
                  }}
                />
              </Link>
            </Boop>,
            <Boop key={2} className="p-5">
              <Link href={LINKEDIN_LINK}>
                <FaLinkedin
                  size="3em"
                  style={{
                    fill: "url(#orange-gradient)",
                  }}
                />
              </Link>
            </Boop>,
            <Boop key={3} className="p-5">
              <Link href={GITHUB_LINK}>
                <FaGithub
                  size="3em"
                  style={{
                    fill: "url(#orange-gradient)",
                  }}
                />
              </Link>
            </Boop>,
          ]}
        />
      </div>
    </div>
  );
};
