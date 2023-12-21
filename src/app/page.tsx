import { HomeContent } from "@/components/content/home";
export default function Home() {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      <div className="h-full w-full grid text-white">
        <HomeContent />
      </div>
    </div>
  );
}
