// Deprecated: Use getStoreStatus from @/app/settings-actions instead
export function isStoreOpen(): boolean {
  return true // Always return true so it doesn't block legacy calls, actual logic handles it elsewhere
}

export function getStoreStatusMessage(): string {
  return "Maaf, kami tutup."
}
