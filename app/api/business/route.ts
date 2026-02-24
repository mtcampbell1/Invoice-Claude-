import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  const body = await req.json();
  const { name, address, city, state, zip, country, phone, email, website, taxId } = body;

  if (!name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }

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
