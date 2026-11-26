import { Badge } from "@/components/ui/badge";
import type { Consultation } from "@/lib/types";

export function ConsultationStatusBadge({
  consultation,
}: {
  consultation: Pick<Consultation, "status">;
}) {
  if (consultation.status === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }

  if (consultation.status === "completed") {
    return <Badge variant="success">Completed</Badge>;
  }

  return <Badge variant="secondary">Scheduled</Badge>;
}
