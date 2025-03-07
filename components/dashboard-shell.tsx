import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
  isDarkMode?: boolean
}

export function DashboardShell({ children, isDarkMode }: DashboardShellProps) {
  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}>
      <div className="flex-1 flex flex-col">
        <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xl ml-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>SocialTuner</span>
            </div>
            <nav className="flex items-center space-x-4">
              {/* ボタンを削除 */}
            </nav>
          </div>
        </header>
        <main className={`flex-1 space-y-4 p-8 pt-6 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
          <div className="container">{children}</div>
        </main>
      </div>
    </div>
  )
}

