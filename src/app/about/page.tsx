import { AboutContent } from "@/components/content/about";

export default function About() {
  return (
    <div className="z-20 absolute top-0 left-0 h-screen w-screen">
      <div className="h-full w-full grid">
        <AboutContent />
      </div>
    </div>
  );
}
