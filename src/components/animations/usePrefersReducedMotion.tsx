"use client";
import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: no-preference)";

const getInitialState = () => {
  if (typeof window !== "undefined") return !window?.matchMedia(QUERY).matches;
  return false;
};

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(getInitialState);
  useEffect(() => {
    const mediaQueryList = window?.matchMedia(QUERY);
    //@ts-ignore
    const listener = (event) => {
      setPrefersReducedMotion(!event.matches);
    };
    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, []);
  return prefersReducedMotion;
}
