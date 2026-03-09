export const COLORS = {
  teal: { bg: "#4ecdc4", text: "#ffffff" },
  yellow: { bg: "#ffd63f", text: "#1a1a2e" },
  blue: { bg: "#4895f6", text: "#ffffff" },
  cyan: { bg: "#48d4f6", text: "#ffffff" },
  orange: { bg: "#ff5f3f", text: "#ffffff" },
  lime: { bg: "#87cb34", text: "#ffffff" },
};

export type ColorKey = keyof typeof COLORS;

export interface PrayCardProps {
  name?: string;
  startOn?: string;
  iqamah?: string;
  active?: boolean;
  activeColor?: ColorKey;
  borderColor?: string;
}

export interface TerbitCardProps {
  label?: string;
  mulai?: string;
  iqamah?: string;
  color?: ColorKey;
}

export interface ShalatCardGroupProps {
  items?: Array<{
    name?: string;
    startOn?: string;
    iqamah?: string;
    active?: boolean;
    activeColor?: ColorKey;
  }>;
  terbit?: {
    label?: string;
    mulai?: string;
    iqamah?: string;
    color?: ColorKey;
  } | null;
  accentColor?: ColorKey;
  headerColor?: ColorKey;
  borderColor?: string;
}
