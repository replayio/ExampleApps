export function compactNumber(value: number) {
  if (value >= 1000) {
    const rounded = value / 1000
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}K`
  }
  return String(value)
}

export function relativeDate(date: string) {
  const elapsed = Date.now() - new Date(date).getTime()
  const minutes = Math.max(1, Math.round(elapsed / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d`
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(date)
  )
}

export function truncate(value: string, max: number) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}...`
}
