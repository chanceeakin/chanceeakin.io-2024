
The `@ts-nocheck` directive is used in the following files:

* `src/components/animations/boxes.tsx`
* `src/components/animations/stars.tsx`

The reason for its use in these files is to suppress TypeScript errors that are arising from the use of the `three.js` and `@react-three/drei` libraries. It's likely that there are some type-related issues in those libraries or in the way they are being used that are difficult to resolve, so `@ts-nocheck` is used as a temporary workaround.
