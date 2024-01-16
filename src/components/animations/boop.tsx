"use client";
import { animated, useSpring } from "react-spring";
import React, { useState, useEffect, ReactNode } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export const Boop = ({
  rotation = 70,
  timing = 30,
  children,
  className = "",
}: {
  rotation?: number;
  timing?: number;
  children: ReactNode;
  className?: string;
}) => {
  const [isBooped, setIsBooped] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const style = useSpring({
    display: "inline-block",
    backfaceVisibility: "hidden",
    transform: isBooped ? `rotate(${rotation}deg)` : `rotate(0deg)`,
    transition: `transform ${timing}ms`,
    immediate: prefersReducedMotion,
  });

  useEffect(() => {
    if (!isBooped) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setIsBooped(false);
    }, timing);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isBooped, timing]);

  const trigger = () => {
    setIsBooped(true);
  };

  return (
    // @ts-ignore
    <animated.span onMouseEnter={trigger} className={className} style={style}>
      {children}
    </animated.span>
  );
};
