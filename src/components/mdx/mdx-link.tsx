"use client";
import Link from "next/link";

// @ts-ignore
export const MDXLink = (props) => (
  <Link
    className="text-accent underline underline-offset-4 hover:text-ink"
    {...props}
    href={props?.href || ""}
  >
    {props.children}
  </Link>
);
