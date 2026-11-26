import Link from "next/link";

import { ConsultationList } from "@/components/consultation-list";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/auth";
import { getStudentConsultations } from "@/lib/queries/consultations";

export default async function DashboardPage() {
  const { user } = await requireStudent();
  const { consultations, error } = await getStudentConsultations(user.id);

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
        initialConsultations={consultations}
        initialError={error}
      />
    </div>
  );
}
