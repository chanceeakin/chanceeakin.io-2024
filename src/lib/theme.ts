export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "theme";

// Runs before first paint so the chosen theme never flashes.
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
