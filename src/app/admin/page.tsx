import { AdminCms } from "./cms";
import { getAdminCmsData, getAdminOverview } from "@/lib/admin/data";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { Notification } from "@/components/ui/notification";

export const metadata = {
  title: "Admin | Mahmudul Hassan Masum",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!getSupabasePublicConfig()) {
    return (
      <main className="admin-page section-shell">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Private area
          </p>
          <h1>Portfolio administration</h1>
        </div>
        <Notification>
          Configure Supabase environment variables to enable administrator
          sign-in and database-backed content management.
        </Notification>
      </main>
    );
  }

  const [overview, data] = await Promise.all([
    getAdminOverview(),
    getAdminCmsData(),
  ]);

  return <AdminCms data={data} overview={overview} />;
}
