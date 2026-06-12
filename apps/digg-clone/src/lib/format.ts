export function timeAgo(date: string) {
  const elapsed = Date.now() - new Date(date).getTime()
  const minutes = Math.max(1, Math.round(elapsed / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, "0")}`
}

export function truncate(value: string, length: number) {
  if (value.length <= length) return value
  return `${value.slice(0, length - 1).trim()}...`
}
