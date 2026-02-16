"use client"

import { ReactNode } from "react"

export function SecurityWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
      className="h-full w-full"
    >
      {children}
    </div>
  )
}
