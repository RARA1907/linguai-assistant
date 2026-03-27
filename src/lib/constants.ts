/**
 * Application constants
 */

export const APP_NAME = "Proje Sablonu";
export const APP_DESCRIPTION = "MAYK v2.0 proje sablonu";

/**
 * Routes
 */
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
} as const;

/**
 * API Endpoints (if using external APIs)
 */
export const API_ENDPOINTS = {
  // Add your endpoints here
} as const;

/**
 * Breakpoints (match Tailwind)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
