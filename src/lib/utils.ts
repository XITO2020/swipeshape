// src/lib/utils.ts
import { ClassValue, clsx } from "clsx";

/**
 * Merges class names using clsx
 * This allows for conditional class name application
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
