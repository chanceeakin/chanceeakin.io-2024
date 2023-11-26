"use client";
import { animated, useSpring } from "react-spring";
import React, { useState, useEffect, ReactNode } from "react";

export const Boop = ({
  rotation = 30,
  timing = 40,
  children,
}: {
  rotation?: number;
  timing?: number;
  children: ReactNode;
}) => {
  const [isBooped, setIsBooped] = useState(false);
  const style = useSpring({
    display: "inline-block",
    backfaceVisibility: "hidden",
    transform: isBooped ? `rotate(${rotation}deg)` : `rotate(0deg)`,
    transition: `transform ${timing}ms`,
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
    <animated.span onMouseEnter={trigger} style={style}>
      {children}
    </animated.span>
  );
};
