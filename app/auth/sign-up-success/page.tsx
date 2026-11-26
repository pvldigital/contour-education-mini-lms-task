import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Thank you for signing up!
        </h1>
        <CardDescription>Check your email to confirm</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You&apos;ve successfully signed up. Please check your email to confirm
          your account before signing in.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
