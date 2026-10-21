import { notFound } from "next/navigation";

// Unmatched paths under a valid locale render the localized not-found page.
export default function CatchAll() {
  notFound();
}
