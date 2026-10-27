"use server";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

// Setting a cookie inside a server action refreshes the current route, so the
// page re-renders in the new language without changing the URL.
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
