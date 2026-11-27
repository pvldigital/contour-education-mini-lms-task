import { redirect } from "next/navigation";

import { AdminConsultations } from "@/components/admin-consultations";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { getAdminConsultations } from "@/lib/queries/consultations";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const page = parsePage((await searchParams).page);
  const { consultations, pagination, error } = await getAdminConsultations({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  if (page !== pagination.page || page > pagination.totalPages) {
    redirect(
      pagination.totalPages === 1
        ? "/admin/consultations"
        : `/admin/consultations?page=${pagination.totalPages}`,
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          All consultations across the system. Read-only.
        </p>
      </div>

      <AdminConsultations
        key={pagination.page}
        initialConsultations={consultations}
        initialPagination={pagination}
        initialError={error}
      />
    </div>
  );
}
