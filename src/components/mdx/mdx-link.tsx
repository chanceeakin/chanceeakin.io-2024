"use client";
import Link from "next/link";

// @ts-ignore
export const MDXLink = (props) => (
  <Link {...props} href={props?.href || ""}>
    {props.children}
  </Link>
);
