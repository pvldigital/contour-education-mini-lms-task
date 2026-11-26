import { AdminConsultations } from "@/components/admin-consultations";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          All consultations across the system. Read-only.
        </p>
      </div>

      <AdminConsultations />
    </div>
  );
}
