import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div>
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold">Industry not found</h1>
        <p className="mt-2 text-muted-foreground">
          That niche isn&apos;t available yet. Pick one from the selector to get started.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to industries</Link>
        </Button>
      </div>
    </main>
  );
}
