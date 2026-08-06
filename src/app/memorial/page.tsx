import { MemorialContent } from "@/components/content/memorial";

export default function Memorial() {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen page-enter">
      <div className="h-full w-full grid">
        <MemorialContent />
      </div>
    </div>
  );
}
