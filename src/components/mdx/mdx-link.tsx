"use client";
import Link from "next/link";

// @ts-ignore
export const MDXLink = (props) => (
  <Link
    className="text-amber-300 hover:text-amber-500"
    {...props}
    href={props?.href || ""}
  >
    {props.children}
  </Link>
);
