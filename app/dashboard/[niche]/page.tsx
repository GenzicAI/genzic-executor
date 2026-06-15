import { notFound } from "next/navigation";
import { NICHES, getNiche } from "@/lib/niches";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

// Pre-render a static route for every registered niche.
export function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ niche: string }>;
}) {
  const { niche: nicheId } = await params;
  const niche = getNiche(nicheId);
  return {
    title: niche ? `${niche.label} · NicheLead AI` : "NicheLead AI",
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ niche: string }>;
}) {
  const { niche: nicheId } = await params;
  const niche = getNiche(nicheId);
  if (!niche) notFound();

  // Key on niche.id so the shell fully remounts when switching industries.
  return <DashboardShell key={niche.id} nicheId={niche.id} />;
}
