import { HomeFallback } from "@/components/suspense/home-fallback";
import { Suspense, lazy } from "react";

const HomeContent = lazy(() => import("@/components/content/home"));
export default function Home() {
  return (
    <div className="z-20 absolute top-0 left-0 h-screen w-screen">
      <div className="h-full w-full grid text-white">
        <Suspense fallback={<HomeFallback />}>
          <HomeContent />
        </Suspense>
      </div>
    </div>
  );
}
