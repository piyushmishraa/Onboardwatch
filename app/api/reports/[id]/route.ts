import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { reports } from "@/db/schema";
import { eq } from "drizzle-orm";

function getAdminKey() {
  return process.env.ADMIN_KEY || "";
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== getAdminKey()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const reportId = Number(id);

  if (!Number.isInteger(reportId) || reportId <= 0) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  const deleted = await db.delete(reports).where(eq(reports.id, reportId)).returning({ id: reports.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

