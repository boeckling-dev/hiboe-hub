import { UserButton } from '@clerk/nextjs'
import { SideNav } from '@/components/layout/side-nav'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar — mobile only */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <span className="font-semibold text-foreground">
          <span className="mr-1.5">🏠</span>Family Hub
        </span>
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/sign-in" />
          <MobileNav />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-60 flex-col border-r bg-sidebar lg:flex">
          <div className="flex h-14 items-center border-b px-4">
            <span className="font-semibold text-foreground">
              <span className="mr-1.5">🏠</span>Family Hub
            </span>
          </div>
          <SideNav />
          <div className="mt-auto p-4">
            <UserButton afterSignOutUrl="/sign-in" showName />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Bottom tab bar — mobile only */}
      <MobileNav variant="bottom-tabs" />
    </div>
  )
}
