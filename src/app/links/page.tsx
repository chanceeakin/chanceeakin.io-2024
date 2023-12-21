import { LinksContent } from "@/components/content/links";

export default function Links() {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      <div className="h-full w-full grid">
        <LinksContent />
      </div>
    </div>
  );
}
