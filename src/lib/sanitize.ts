const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(raw: string): string {
  return raw.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch)
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function truncate(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}
