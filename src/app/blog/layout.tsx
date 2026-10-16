export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-enter mx-auto w-full max-w-2xl px-6 pt-16 md:pt-24">
      {children}
    </div>
  );
}
