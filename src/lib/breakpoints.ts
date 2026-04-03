/**
 * Canonical viewport breakpoints (px).
 * Use with useMediaQuery(`(min-width: ${BP.lg}px)`) or helpers below.
 * Align new @media rules in CSS to these values when possible.
 */
export const BP = {
  xs: 390,
  sm: 480,
  md: 768,
  lg: 900,
  xl: 1024,
  xxl: 1280,
} as const;

export type BreakpointName = keyof typeof BP;

export function mediaUp(name: BreakpointName): string {
  return `(min-width: ${BP[name]}px)`;
}

export function mediaDown(name: BreakpointName): string {
  return `(max-width: ${BP[name] - 1}px)`;
}

/** Recruiter toolbar: show full action row at this width and above. */
export const RECRUITER_EXPANDED_QUERY = mediaUp("lg");
