
## Relations
@project/dependencies

This project uses Tailwind CSS for styling, as defined in `tailwind.config.ts`. The configuration specifies the content paths to be scanned for Tailwind classes.

---

The `.prettierrc` file is configured to wrap prose always.

---

Global styles are defined in `src/app/globals.css` and `src/app/styles.css`. `globals.css` sets up Tailwind's base, components, and utilities. `styles.css` includes additional global styles, such as a default background color (`#020617`), a base font stack, and some CSS animations.

---

The primary styling libraries are:

* `tailwindcss`
* `postcss`

The code formatting is handled by `prettier`. The style is also influenced by `eslint-config-next`.
