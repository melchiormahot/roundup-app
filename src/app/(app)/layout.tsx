import { BottomNav } from "@/components/BottomNav";
import { Toast } from "@/components/ui/Toast";
import { NetworkStatus } from "@/components/NetworkStatus";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-900 pb-24 overscroll-contain select-none">
      <NetworkStatus />
      <Toast />
      {children}
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
