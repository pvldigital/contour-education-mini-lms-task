import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewConsultationPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Book consultation</h1>
        <p className="text-sm text-muted-foreground">
          Choose a time and tell us what you would like to discuss.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking form</CardTitle>
          <CardDescription>
            The booking form is added in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          First name, last name, reason, and consultation datetime will be
          collected here.
        </CardContent>
      </Card>
    </div>
  );
}
