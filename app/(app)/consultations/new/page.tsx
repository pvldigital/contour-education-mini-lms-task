import { BookingForm } from "@/components/booking-form";
import { requireStudent } from "@/lib/auth";

export default async function NewConsultationPage() {
  await requireStudent();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Book consultation</h1>
        <p className="text-sm text-muted-foreground">
          Choose a time and tell us what you would like to discuss.
        </p>
      </div>

      <BookingForm />
    </div>
  );
}
