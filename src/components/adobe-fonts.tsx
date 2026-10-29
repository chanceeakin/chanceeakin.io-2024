const KIT_URL = "https://use.typekit.net/iyi4qzl.css";

/**
 * Adobe Fonts serves `font-display:auto`, which can hide text while the font
 * loads, and we can't override another stylesheet's @font-face from our own
 * CSS. So the server fetches the kit CSS, switches it to `swap`, and inlines
 * it: no render-blocking stylesheet request, and text paints immediately in
 * the fallback font. The font files themselves still load from Adobe.
 * Cached for a day; if the fetch fails we fall back to the plain stylesheet.
 */
export default async function AdobeFonts() {
  let css: string | null = null;
  try {
    const res = await fetch(KIT_URL, { next: { revalidate: 86400 } });
    if (res.ok) {
      css = (await res.text()).replace(/font-display:\s*auto/g, "font-display:swap");
    }
  } catch {}

  return (
    <>
      <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
      {css ? (
        <style dangerouslySetInnerHTML={{ __html: css }} />
      ) : (
        <link rel="stylesheet" href={KIT_URL} precedence="default" />
      )}
    </>
  );
}
