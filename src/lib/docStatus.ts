import type { DocStatus } from "@/types";

/**
 * Calculate document status based on expiry date.
 * - Expired: expiryDate is in the past
 * - Expiring Soon: expiryDate is within 30 days
 * - Valid: otherwise
 */
export function computeDocStatus(expiryDate: string): DocStatus {
  const expiry = new Date(expiryDate).getTime();
  const now = Date.now();
  if (expiry < now) return "Expired";
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (expiry - now < thirtyDays) return "Expiring Soon";
  return "Valid";
}
