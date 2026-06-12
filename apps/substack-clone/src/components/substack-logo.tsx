export function SubstackLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <span className="relative flex size-9 items-center justify-center rounded-md bg-[#ff6719]">
        <span className="absolute top-2 h-1 w-5 rounded-sm bg-white" />
        <span className="absolute top-3.5 h-1 w-5 rounded-sm bg-white" />
        <span className="absolute bottom-1.5 h-4 w-5 overflow-hidden">
          <span className="absolute left-0 top-0 h-4 w-2 bg-white" />
          <span className="absolute right-0 top-0 h-4 w-2 bg-white" />
          <span className="absolute left-1/2 top-1 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#ff6719]" />
        </span>
      </span>
      {!compact && <span className="text-3xl font-black">Substack</span>}
    </div>
  )
}
