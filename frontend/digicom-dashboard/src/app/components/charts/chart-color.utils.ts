import { color } from 'echarts/core';

export const CHART_COLORS = {
  white: '#fff',
  black: '#000',
  text: '#111827',
  mutedText: '#595959',
  border: '#e5e7eb',
  quality: {
    1: '#b91c1c',
    2: '#c2410c',
    3: '#a16207',
    4: '#0f766e',
    5: '#1d4ed8',
  },
} as const;

// WCAG relative luminance uses linear sRGB channels and these standard weights.
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_GAMMA = 2.4;
const RGB_CHANNEL_MAX = 255;
const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722];
const CONTRAST_OFFSET = 0.05;

export function contrastingTextColor(backgroundColor: string): string {
  const channels = color.parse(backgroundColor)!.slice(0, 3);
  const luminance = channels.reduce((sum, channel, index) => {
    const normalized = channel / RGB_CHANNEL_MAX;
    const linear =
      normalized <= SRGB_LINEAR_THRESHOLD
        ? normalized / SRGB_LINEAR_DIVISOR
        : ((normalized + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_GAMMA;
    return sum + linear * LUMINANCE_WEIGHTS[index];
  }, 0);

  const whiteContrast = (1 + CONTRAST_OFFSET) / (luminance + CONTRAST_OFFSET);
  const blackContrast = (luminance + CONTRAST_OFFSET) / CONTRAST_OFFSET;
  return whiteContrast > blackContrast ? CHART_COLORS.white : CHART_COLORS.black;
}
