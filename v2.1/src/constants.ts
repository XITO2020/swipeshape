// src/constants.ts
// Configuration values and constants for the application

// Newsletter configuration
export const EMAIL_LIST = {
  NEWSLETTER: "newsletter_subscribers",
  UPDATES: "product_updates"
};

// Email configuration
export const EMAIL_CONFIG = {
  FROM_NAME: "Swipeshape",
  FROM_EMAIL: `no-reply@${process.env.MAILGUN_DOMAIN || "swipeshape.com"}`,
  SUPPORT_EMAIL: "support@swipeshape.com"
};

// Application routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  BLOG: "/blog",
  PROGRAMS: "/programs"
};
