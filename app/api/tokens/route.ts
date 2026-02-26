import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTokenStatus } from "@/lib/tokens";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getTokenStatus(session.user.id);
  return NextResponse.json(status);
}

// Testing endpoint — only enabled when ENABLE_DEV_RESET=true env var is set.
// Resets guest tokens (by IP) or signed-in user tokens.
export async function POST(request: Request) {
  if (process.env.ENABLE_DEV_RESET !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);

  // Signed-in user reset
  if (session?.user?.id) {
    const { tokens = 10 } = await request.json().catch(() => ({}));
    await prisma.user.update({
      where: { id: session.user.id },
      data: { tokens, tokensResetAt: new Date() },
    });
    const status = await getTokenStatus(session.user.id);
    return NextResponse.json({ message: "User tokens reset", ...status });
  }

  // Guest reset — clear the GuestUsage record for this IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "127.0.0.1";

  await prisma.guestUsage.deleteMany({ where: { ip } });
  return NextResponse.json({ message: "Guest tokens reset for IP", ip });
}
