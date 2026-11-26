import { Badge } from "@/components/ui/badge";
import type { Consultation } from "@/lib/types";

export function ConsultationStatusBadge({
  consultation,
}: {
  consultation: Pick<Consultation, "completed" | "status">;
}) {
  if (consultation.status === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }

  if (consultation.completed) {
    return <Badge variant="secondary">Completed</Badge>;
  }

  return <Badge variant="outline">Scheduled</Badge>;
}
