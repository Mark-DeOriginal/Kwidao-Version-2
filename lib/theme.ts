export const themeFallbacks = {
  canvas: "#FBFBFB",
  canvasAlt: "#F5F3FA",
  surface: "#F7F4FC",
  surfaceSoft: "#F6F9FF",
  surfaceStrong: "#EEE8FA",
  surfaceContrast: "#F4F8FF",
  surfaceContrastStrong: "#EEF4FF",
  text: "#190B23",
  textStrong: "#190B23",
  textMuted: "#51445F",
  textSoft: "#72667F",
  primary: "#5D47B0",
  primaryStrong: "#2D214E",
  primaryWeak: "#8B7BCD",
  accent: "#DD9B73",
  softAccent: "#CAC3E7",
  border: "#C9C5DF",
  borderStrong: "#AEA3D3",
  positive: "#2F9B75",
  warning: "#DD9B73",
  danger: "#D8667E",
  info: "#4F6FD8",
} as const;

export type ThemeToken = keyof typeof themeFallbacks;

export function themeVar(token: ThemeToken) {
  return `var(--theme-${token.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)})`;
}

export function resolveThemeToken(token: ThemeToken) {
  return themeFallbacks[token];
}

export function readResolvedThemeToken(token: ThemeToken) {
  const fallback = themeFallbacks[token];

  if (typeof window === "undefined" || !document.body) {
    return fallback;
  }

  const cssToken = token.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const varRef = `var(--theme-${cssToken})`;
  const probe = document.createElement("div");

  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.opacity = "0";
  probe.style.color = fallback;
  probe.style.color = varRef;

  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color.trim();
  probe.remove();

  return resolved || fallback;
}
