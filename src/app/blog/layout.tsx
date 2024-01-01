import type { Metadata } from "next";
import { lazy, Suspense } from "react";

const Nav = lazy(() => import("@/components/nav"));
const Analytics = lazy(() => import("@/components/gtm"));

export const metadata: Metadata = {
  title: "Chance Eakin",
  description: "I write code sometimes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-slate-50">{children}</div>;
}
