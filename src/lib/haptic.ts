// Haptic feedback utility
// Uses navigator.vibrate() on Android, CSS active states as fallback on iOS

type HapticType = "light" | "medium" | "success" | "error";

const patterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  success: [10, 50, 10],
  error: [30, 30, 30],
};

let enabled = true;

export function setHapticEnabled(value: boolean) {
  enabled = value;
  if (typeof window !== "undefined") {
    localStorage.setItem("roundup_haptic", value ? "1" : "0");
  }
}

export function getHapticEnabled(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("roundup_haptic");
    if (stored !== null) {
      enabled = stored === "1";
    }
  }
  return enabled;
}

export function haptic(type: HapticType = "light") {
  if (!enabled) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(patterns[type]);
    } catch {
      // Vibration not supported or blocked
    }
  }
}
