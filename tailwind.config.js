/** @type {import('tailwindcss').Config} */

import { colors } from "./src/constants/colors.ts";

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      fontFamily: {
        grotesk: ["SpaceGrotesk_400Regular"],
        "grotesk-medium": ["SpaceGrotesk_500Medium"],
        "grotesk-semibold": ["SpaceGrotesk_600SemiBold"],
        "grotesk-bold": ["SpaceGrotesk_700Bold"],
        liberation: ["LiberationMono"],
        "liberation-bold": ["LiberationMonoBold"],
      },
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        tertiary: colors.tertiary,
        background: colors.background,
        lightText: colors.lightText,
      },
    },
  },

  plugins: [],
};
