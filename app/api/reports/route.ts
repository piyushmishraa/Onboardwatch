import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { reports } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createHash } from "crypto";

const VALID_STATUSES = ["delayed", "onboarded", "offer_revoked", "no_update"];

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

export async function GET() {
  const all = await db.select().from(reports).orderBy(desc(reports.createdAt)).limit(500);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, batchYear, status, note } = body;

    if (!company || typeof company !== "string" || company.trim().length === 0) {
      return NextResponse.json({ error: "Company is required" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (company.length > 120 || (note && note.length > 500)) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    // Lightweight spam throttle: hash the caller's IP, don't store it raw.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);

    const recentFromIp = await db
      .select()
      .from(reports)
      .where(eq(reports.ipHash, ipHash))
      .orderBy(desc(reports.createdAt))
      .limit(1);

    if (recentFromIp.length > 0) {
      const lastTs = new Date(recentFromIp[0].createdAt).getTime();
      if (Date.now() - lastTs < 60_000) {
        return NextResponse.json(
          { error: "Please wait a minute before submitting another report." },
          { status: 429 }
        );
      }
    }

    const [created] = await db
      .insert(reports)
      .values({
        company: company.trim(),
        batchYear: batchYear?.trim() || null,
        status,
        note: note?.trim() || null,
        ipHash,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
