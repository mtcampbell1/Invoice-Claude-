import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/tokens";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(business);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const plan = PLANS[user?.plan as keyof typeof PLANS] ?? PLANS.free;
  if (!plan.canSaveBusiness) {
    return NextResponse.json(
      { error: "Upgrade to Pro or Business plan to save business info" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, address, city, state, zip, country, phone, email, website, taxId } = body;

  const business = await prisma.business.upsert({
    where: { userId: session.user.id },
    update: { name, address, city, state, zip, country, phone, email, website, taxId },
    create: {
      userId: session.user.id,
      name,
      address,
      city,
      state,
      zip,
      country,
      phone,
      email,
      website,
      taxId,
    },
  });

  return NextResponse.json(business);
}
