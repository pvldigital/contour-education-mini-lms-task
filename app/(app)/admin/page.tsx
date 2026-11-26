import { AdminConsultations } from "@/components/admin-consultations";
import { requireAdmin } from "@/lib/auth";
import { getAdminConsultations } from "@/lib/queries/consultations";

export default async function AdminPage() {
  await requireAdmin();
  const { consultations, error } = await getAdminConsultations();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          All consultations across the system. Read-only.
        </p>
      </div>

      <AdminConsultations
        initialConsultations={consultations}
        initialError={error}
      />
    </div>
  );
}
