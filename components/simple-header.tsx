"use client"

import { QrCode } from "lucide-react"

interface SimpleHeaderProps {
  onQRClick?: () => void
}

export default function SimpleHeader({ onQRClick }: SimpleHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">MB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MyBank</h1>
              <p className="text-xs text-muted-foreground">Digital Banking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onQRClick}
              className="p-2 hover:bg-muted rounded-lg transition text-foreground hover:text-primary"
              title="Show Account QR Code"
            >
              <QrCode className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg">👤</div>
          </div>
        </div>
      </div>
    </header>
  )
}
