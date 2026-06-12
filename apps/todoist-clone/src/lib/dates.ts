import { format, isAfter, isBefore, startOfDay } from "date-fns"

// Parse a stored "YYYY-MM-DD" string into a Date.
function parse(dateStr: string): Date {
  return new Date(dateStr)
}

export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  const due = parse(dateStr)
  const today = new Date()
  return due.toDateString() === today.toDateString()
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  const due = parse(dateStr)
  return isBefore(due, startOfDay(new Date())) && !isToday(dateStr)
}

export function isUpcoming(dateStr: string | null): boolean {
  if (!dateStr) return false
  const due = parse(dateStr)
  return isAfter(due, startOfDay(new Date()))
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return ""
  if (isToday(dateStr)) return "Today"
  const due = parse(dateStr)
  return format(due, "d MMM")
}

export function formatDueWeekday(dateStr: string | null): string {
  if (!dateStr) return ""
  return format(parse(dateStr), "EEEE")
}
