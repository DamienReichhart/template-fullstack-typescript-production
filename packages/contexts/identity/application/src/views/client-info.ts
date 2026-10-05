/** Where a request comes from, recorded on the session it opens. */
export interface ClientInfo {
  userAgent?: string | null;
  ipAddress?: string | null;
}
