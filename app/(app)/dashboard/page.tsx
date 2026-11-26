import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>No consultations yet</CardTitle>
          <CardDescription>
            Your consultation list will appear here once the booking flow is
            connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/consultations/new">Book your first consultation</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
