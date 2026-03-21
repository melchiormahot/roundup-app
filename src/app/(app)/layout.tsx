import { BottomNav } from "@/components/BottomNav";
import { Toast } from "@/components/ui/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-900 pb-20">
      <Toast />
      {children}
      <BottomNav />
    </div>
  );
}
