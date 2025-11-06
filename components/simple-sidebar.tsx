"use client"

interface SimpleSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabConfig: { [key: string]: { icon: string; label: string } } = {
  dashboard: { icon: "📊", label: "Dashboard" },
  transfers: { icon: "➡️", label: "Send Money" },
  transactions: { icon: "📜", label: "History" },
  bills: { icon: "📋", label: "Bills" },
  requests: { icon: "🤝", label: "Requests" },
  qr: { icon: "📱", label: "Scan QR" },
  chat: { icon: "💬", label: "Assistant" },
}

export default function SimpleSidebar({ activeTab, setActiveTab }: SimpleSidebarProps) {
  const tabs = ["dashboard", "transfers", "transactions", "bills", "requests", "qr", "chat"]

  return (
    <>
      <div className="hidden md:flex w-56 bg-white dark:bg-slate-900 border-r border-border p-6 flex-col gap-2 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
              activeTab === tab ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted"
            }`}
          >
            <span className="text-lg">{tabConfig[tab].icon}</span>
            <span>{tabConfig[tab].label}</span>
          </button>
        ))}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-border">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center transition-all flex flex-col items-center gap-1 ${
                activeTab === tab
                  ? "bg-primary/10 text-primary border-t-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">{tabConfig[tab].icon}</span>
              <span className="text-xs font-medium hidden">{tabConfig[tab].label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
