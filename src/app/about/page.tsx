import Link from "next/link";

export default function About() {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      <div className="h-full w-full grid">
        <h1
          className="place-self-center text-9xl
				bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 inline-block text-transparent bg-clip-text"
        >
          <Link href="/">About</Link>
        </h1>
      </div>
    </div>
  );
}
