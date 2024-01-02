export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-slate-50 container m-auto grid grid-cols-12 gap-4 pt-16">
      <div className="flex flex-col col-span-10 col-start-2 md:col-span-8 md:col-start-3 lg:col-start-4 lg:col-span-6">
        {children}
      </div>
    </div>
  );
}
