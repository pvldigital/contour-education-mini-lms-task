import Link from "next/link";

import { ConsultationList } from "@/components/consultation-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Consultation } from "@/lib/types";

export default async function DashboardPage() {
  const { user } = await requireStudent();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, student_id, first_name, last_name, reason, scheduled_at, completed, status, created_at",
    )
    .eq("student_id", user.id)
    .order("scheduled_at", { ascending: true });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
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

      {error ? (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Could not load consultations
            </h2>
            <CardDescription>
              Refresh the page to try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Something went wrong while loading your consultations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ConsultationList
          consultations={(data ?? []) as Consultation[]}
        />
      )}
    </div>
  );
}
