"use client";
import Link from "next/link";
import { useRef } from "react";
import { Parallax, ParallaxLayer, IParallax } from "@react-spring/parallax";

export const LinksContent = () => {
  const parallax = useRef<IParallax>(null);

  return (
    <Parallax pages={6} ref={parallax} horizontal>
      <ParallaxLayer offset={0} speed={1.5} className="flex justify-center">
        <h1
          className="place-self-center text-9xl
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text background-animate"
        >
          <Link href="/">Links</Link>
        </h1>
      </ParallaxLayer>
      {/* <ParallaxLayer
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis
          tincidunt id aliquet risus feugiat in. Rhoncus aenean vel elit
          scelerisque. Pellentesque elit eget gravida cum sociis natoque. Non
          nisi est sit amet facilisis magna etiam tempor. In cursus turpis massa
          tincidunt dui ut ornare. Volutpat lacus laoreet non curabitur.
          Volutpat est velit egestas dui id. Non diam phasellus vestibulum lorem
          sed. Urna et pharetra pharetra massa. Cursus vitae congue mauris
          rhoncus. Aliquet eget sit amet tellus. Posuere sollicitudin aliquam
          ultrices sagittis. Urna neque viverra justo nec ultrices dui sapien
          eget mi.
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis
          tincidunt id aliquet risus feugiat in. Rhoncus aenean vel elit
          scelerisque. Pellentesque elit eget gravida cum sociis natoque. Non
          nisi est sit amet facilisis magna etiam tempor. In cursus turpis massa
          tincidunt dui ut ornare. Volutpat lacus laoreet non curabitur.
          Volutpat est velit egestas dui id. Non diam phasellus vestibulum lorem
          sed. Urna et pharetra pharetra massa. Cursus vitae congue mauris
          rhoncus. Aliquet eget sit amet tellus. Posuere sollicitudin aliquam
          ultrices sagittis. Urna neque viverra justo nec ultrices dui sapien
          eget mi.
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis
          tincidunt id aliquet risus feugiat in. Rhoncus aenean vel elit
          scelerisque. Pellentesque elit eget gravida cum sociis natoque. Non
          nisi est sit amet facilisis magna etiam tempor. In cursus turpis massa
          tincidunt dui ut ornare. Volutpat lacus laoreet non curabitur.
          Volutpat est velit egestas dui id. Non diam phasellus vestibulum lorem
          sed. Urna et pharetra pharetra massa. Cursus vitae congue mauris
          rhoncus. Aliquet eget sit amet tellus. Posuere sollicitudin aliquam
          ultrices sagittis. Urna neque viverra justo nec ultrices dui sapien
          eget mi.
        </p>
      </ParallaxLayer> */}
    </Parallax>
  );
};
