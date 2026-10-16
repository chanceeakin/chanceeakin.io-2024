"use client";
import { useEffect, useRef } from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
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

  const socials = [
    { href: INSTAGRAM_LINK, label: "Instagram", Icon: FaInstagram },
    { href: LINKEDIN_LINK, label: "LinkedIn", Icon: FaLinkedin },
  ];
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 pt-16 pb-12 text-center md:pt-24">
      <p className="eyebrow mb-6">Remembered</p>
      <h1 className="display text-4xl sm:text-6xl">In Loving Memory</h1>
      <p className="mt-4 font-hand text-2xl text-teak">
        Your favorite former coworker.
      </p>

      <Image
        src="/images/chance_memorial_larger.jpeg"
        alt="Chance Eakin"
        width={1280}
        height={859}
        className="mt-8 w-full rounded-[4px] border border-sand"
      />

      <div className="mt-8 w-full">
        <div ref={embedRef} />
      </div>

      <p className="mt-10 text-sm text-oak">Find me here.</p>
      <div className="mt-4 flex gap-4">
        {socials.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-14 w-14 place-items-center rounded-full border border-taupe transition-colors hover:bg-rosewood hover:text-cream"
          >
            <Icon size="1.5em" />
          </Link>
        ))}
      </div>
    </div>
  );
};
