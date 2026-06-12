export function AcctualLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden
      >
        <circle cx="8" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">Acctual</span>
    </div>
  )
}
