import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ db: "ok" });
  } catch (error: any) {
    return NextResponse.json(
      { db: "error", message: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
