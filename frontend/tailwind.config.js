/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        border: "var(--color-border)",
        placeholder: "var(--color-placeholder)",
      },
    },
  },
  plugins: [],
}


// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: "var(--color-primary)",
//         secondary: "var(--color-secondary)",
//         accent: "var(--color-accent)",
//         background: "var(--color-background)",
//         surface: "var(--color-surface)",
//         text: "var(--color-text)",
//         border: "var(--color-border)",
//         card: "var(--color-card)",
//         input: "var(--color-input)",
//         "button-text": "var(--color-button-text)",
//         placeholder: "var(--color-placeholder)",
//       },
//     },
//   },
//   plugins: [],
// }




// /** @type {import('tailwindcss').Config} */
// export default {
//     content: [
//       "./index.html",
//       "./src/**/*.{js,ts,jsx,tsx}",
//     ],

//   theme: {
//     extend: {
//       colors: {
//         primary: "var(--color-primary)",
//         secondary: "var(--color-secondary)",
//         accent: "var(--color-accent)",
//         background: "var(--color-background)",
//         surface: "var(--color-surface)",
//         text: "var(--color-text)",
//         border: "var(--color-border)",
//       },
//     },
//   },
//   plugins: [],
// }