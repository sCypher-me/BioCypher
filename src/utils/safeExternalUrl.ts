export function safeExternalUrl(value: string | null | undefined, allowedHosts?: readonly string[]) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:") return null
    if (allowedHosts?.length && !allowedHosts.includes(url.hostname)) return null
    return url.toString()
  } catch {
    return null
  }
}
