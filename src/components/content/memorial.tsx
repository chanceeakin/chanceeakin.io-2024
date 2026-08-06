"use client";
import { useEffect, useRef } from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Boop } from "@/components/animations/boop";
import { EntryTrailAnimation } from "@/components/animations/entry";
import Link from "next/link";
import Image from "next/image";

const INSTAGRAM_LINK = `https://www.instagram.com/chanceeakin/`;
const LINKEDIN_LINK = `https://www.linkedin.com/in/chanceeakin/`;

const TRACK_URI = "spotify:track:7ySbfLwdCwl1EM0zNCJZ38";

interface SpotifyEmbedController {
  play: () => void;
  pause: () => void;
  addListener: (event: "ready" | "playback_update", cb: () => void) => void;
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void;
  }
}

// Spotify ignores ?autoplay=1 on a plain iframe src. Real playback only
// starts from the official IFrame Controller API.
let spotifyIframeApiPromise: Promise<SpotifyIFrameAPI> | null = null;
function loadSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (!spotifyIframeApiPromise) {
    spotifyIframeApiPromise = new Promise((resolve) => {
      window.onSpotifyIframeApiReady = resolve;
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    });
  }
  return spotifyIframeApiPromise;
}

export const MemorialContent = () => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!embedRef.current) return;
    let cancelled = false;

    // Browsers block unmuted-audio autoplay without a prior user gesture on
    // the page, and Spotify's controller has no mute/volume API to route
    // around that. So: try to play immediately (works for returning
    // visitors browsers judge as high-engagement), and also start it the
    // instant the visitor interacts with the page at all, so it's playing
    // before they've consciously looked for a play button.
    let retryPlay = () => {};

    loadSpotifyIframeApi().then((IFrameAPI) => {
      if (cancelled || !embedRef.current) return;
      IFrameAPI.createController(
        embedRef.current,
        { uri: TRACK_URI, width: "100%", height: "152" },
        (controller) => {
          if (cancelled) return;
          controller.addListener("ready", () => {
            controller.play();
            retryPlay = () => controller.play();
            document.addEventListener("pointerdown", retryPlay, { once: true });
            document.addEventListener("keydown", retryPlay, { once: true });
          });
        },
      );
    });

    return () => {
      cancelled = true;
      document.removeEventListener("pointerdown", retryPlay);
      document.removeEventListener("keydown", retryPlay);
    };
  }, []);

  return (
    <div className="relative flex justify-center flex-col !touch-auto overflow-y-auto pb-6 px-4">
      <h1
        className="place-self-center text-4xl sm:text-5xl lg:text-7xl text-center leading-[1.2] pb-4 mt-[200px]
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text background-animate"
      >
        In Loving Memory
      </h1>
      <p className="place-self-center text-center text-white/60 italic mt-2 max-w-md">
        Your favorite former coworker.
      </p>

      <Image
        src="/images/chance_memorial_larger.jpeg"
        alt="Chance Eakin"
        width={1280}
        height={859}
        className="place-self-center mt-6 w-full max-w-md rounded-lg"
      />

      <div className="place-self-center mt-6 w-full max-w-md">
        <div ref={embedRef} />
      </div>

      <div className="place-self-center mt-6 w-full max-w-md">
        <p className="place-self-center text-center text-white/60 italic mt-2 max-w-md">
          Find me here.
        </p>
      </div>
      <div className="relative z-20 w-full flex justify-center mt-6">
        <EntryTrailAnimation
          items={[
            <Boop key={1} className="p-5">
              <svg width="0" height="0">
                <linearGradient
                  id="orange-gradient-memorial"
                  x1="100%"
                  y1="100%"
                  x2="0%"
                  y2="0%"
                >
                  <stop stopColor="#ec4899" offset="0%" />
                  <stop stopColor="#f97316" offset="100%" />
                </linearGradient>
              </svg>
              <Link
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram
                  size="3em"
                  style={{
                    fill: "url(#orange-gradient-memorial)",
                  }}
                />
              </Link>
            </Boop>,
            <Boop key={2} className="p-5">
              <Link
                href={LINKEDIN_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin
                  size="3em"
                  style={{
                    fill: "url(#orange-gradient-memorial)",
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
