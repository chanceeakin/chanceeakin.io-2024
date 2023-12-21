"use client";
import React, { useState, ReactNode } from "react";
import { useSpring, animated, useTrail, to } from "react-spring";

const words = ["C", "h", "a", "n", "c", "e", "E", "a", "k", "i", "n"];

export function Name() {
  return (
    <>
      <Trail>
        {words.map((word, index) => (
          <SqueezeSpring key={index}>{word}</SqueezeSpring>
        ))}
      </Trail>
    </>
  );
}

export function Trail({ children }: { children?: ReactNode; props?: any }) {
  const items = React.Children.toArray(children);
  const enter = useTrail(items.length, {
    config: {
      mass: 5,
      tension: 2000,
      friction: 135,
    },
    from: {
      opacity: 0,
      x: 0,
      y: 0,
    },
    to: {
      opacity: 1,
      x: 1,
      y: 1,
    },
  });

  return (
    <>
      {enter.map(({ x, y, ...rest }, index) => (
        <animated.div
          key={index}
          style={{
            ...rest,
            transform: to(
              [
                x.to({
                  range: [0, 0.9, 1],
                  output: [0, 1.2, 1],
                }),
                y.to({
                  range: [0, 0.9, 1],
                  output: [0, 0.8, 1],
                }),
              ],
              (x, y) => `scale(${x},${y})`
            ),

            // r.interpolate((r) => `rotate(${r}deg)`)
          }}
        >
          {items[index]}
        </animated.div>
      ))}
    </>
  );
}

export const SqueezeSpring = ({ children }: { children: React.ReactNode }) => {
  const [isHovered, setHovered] = useState(false);

  const { x, y } = useSpring({
    from: { x: 1, y: 1 },
    to: {
      x: isHovered ? 1.3 : 1,
      y: isHovered ? 0.7 : 1,
    },
    config: { mass: 0.5, tension: 120, friction: 2, precision: 0.001 },
  });

  return (
    <animated.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: to(
          [
            x.to({
              range: [0, 0.3, 1],
              output: [1, 1.3, 1],
            }),
            y.to({
              range: [0, 0.3, 1],
              output: [1, 0.7, 1],
            }),
          ],
          (x, y) => `scale(${x},${y})`
        ),
      }}
    >
      {children}
    </animated.div>
  );
};
