import Link from "next/link";
import { redirect } from "next/navigation";

import { ConsultationList } from "@/components/consultation-list";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE, parsePage } from "@/lib/pagination";
import { getStudentConsultations } from "@/lib/queries/consultations";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { user } = await requireStudent();
  const page = parsePage((await searchParams).page);
  const { consultations, pagination, error } = await getStudentConsultations(
    user.id,
    { page, pageSize: DEFAULT_PAGE_SIZE },
  );

  if (page !== pagination.page || page > pagination.totalPages) {
    redirect(
      pagination.totalPages === 1
        ? "/dashboard"
        : `/dashboard?page=${pagination.totalPages}`,
    );
  }

  return (
    <div className="mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your consultations and their status.
          </p>
        </div>
        <Button asChild>
          <Link href="/consultations/new">Book consultation</Link>
        </Button>
      </div>

      <ConsultationList
        key={pagination.page}
        initialConsultations={consultations}
        initialPagination={pagination}
        initialError={error}
      />
    </div>
  );
}
