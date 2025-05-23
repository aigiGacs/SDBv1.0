import { RequireAuth, AdminOnly } from "@/lib/auth";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { AdminDashboard } from "@/components/dashboards/admin";

export default function Admin() {
  // Admin always has full access, so we'll just use year 1 for the header toggle
  return (
    <RequireAuth>
      <AdminOnly>
        <div className="min-h-screen flex flex-col">
          <Header currentYear={1} onYearChange={() => {}} />
          <main className="flex-grow">
            <AdminDashboard />
          </main>
          <Footer />
        </div>
      </AdminOnly>
    </RequireAuth>
  );
}
