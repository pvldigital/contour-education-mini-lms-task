import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          All consultations across the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All consultations</CardTitle>
          <CardDescription>
            The read-only admin table is added in a later step.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Admins will see every student&apos;s consultation here.
        </CardContent>
      </Card>
    </div>
  );
}
