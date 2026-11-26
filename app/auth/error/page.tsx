import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Sorry, something went wrong.
        </h1>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {error
            ? "We could not complete that request. Please try again."
            : "An unspecified error occurred. Please try again."}
        </p>
      </CardContent>
    </Card>
  );
}
