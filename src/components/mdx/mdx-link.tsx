"use client";
import Link from "next/link";

// @ts-ignore
export const MDXLink = (props) => (
  <Link
    className="text-teak underline underline-offset-4 hover:text-rosewood"
    {...props}
    href={props?.href || ""}
  >
    {props.children}
  </Link>
);
