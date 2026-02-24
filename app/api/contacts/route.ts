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
  const maxContacts = plan.maxContacts;

  // Enforce per-plan contact limit (null = unlimited)
  if (maxContacts !== null) {
    const count = await prisma.contact.count({ where: { userId: session.user.id } });
    if (count >= maxContacts) {
      return NextResponse.json(
        {
          error: `Free accounts can save up to ${maxContacts} contacts. Upgrade to save unlimited contacts.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }
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
