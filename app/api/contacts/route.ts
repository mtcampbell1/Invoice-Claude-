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

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const plan = PLANS[user?.plan as keyof typeof PLANS] ?? PLANS.free;

  if (!plan.canSaveContacts) {
    return NextResponse.json([]);
  }

  const contacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const plan = PLANS[user?.plan as keyof typeof PLANS] ?? PLANS.free;

  if (!plan.canSaveContacts) {
    return NextResponse.json(
      { error: "Upgrade to Pro or Business plan to save contacts" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, company, email, phone, address, city, state, zip, country, notes } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      userId: session.user.id,
      name,
      company,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      notes,
    },
  });

  return NextResponse.json(contact);
}
