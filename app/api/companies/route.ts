import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { reports } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      company: reports.company,
      status: reports.status,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(reports)
    .groupBy(reports.company, reports.status);

  const byCompany: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    if (!byCompany[row.company]) byCompany[row.company] = {};
    byCompany[row.company][row.status] = Number(row.count);
  }

  const result = Object.entries(byCompany).map(([company, statusCounts]) => {
    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const delayed = statusCounts["delayed"] || 0;
    return {
      company,
      total,
      delayed,
      onboarded: statusCounts["onboarded"] || 0,
      offerRevoked: statusCounts["offer_revoked"] || 0,
      noUpdate: statusCounts["no_update"] || 0,
      pctDelayed: total ? Math.round((delayed / total) * 100) : 0,
    };
  });

  result.sort((a, b) => b.total - a.total);
  return NextResponse.json(result);
}
