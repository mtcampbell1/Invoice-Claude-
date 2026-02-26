import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTokenStatus } from "@/lib/tokens";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getTokenStatus(session.user.id);
  return NextResponse.json(status);
}

// Dev-only endpoint to reset tokens for testing
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tokens = 10 } = await request.json().catch(() => ({}));

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      tokens,
      tokensResetAt: new Date(),
    },
  });

  const status = await getTokenStatus(session.user.id);
  return NextResponse.json({ message: "Tokens reset", ...status });
}
