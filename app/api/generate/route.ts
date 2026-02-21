import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deductToken } from "@/lib/tokens";
import { generateDocument } from "@/lib/claude";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, data } = await req.json();

    if (!type || !["invoice", "receipt", "statement"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // Deduct a token
    const success = await deductToken(session.user.id);
    if (!success) {
      return NextResponse.json(
        {
          error:
            "No tokens remaining. Please upgrade your plan or wait for your tokens to reset.",
        },
        { status: 402 }
      );
    }

    // Generate document with Claude
    const document = await generateDocument(data, type);

    // Save to database
    const saved = await prisma.document.create({
      data: {
        userId: session.user.id,
        type,
        number: document.number,
        clientName: document.to.name,
        total: document.total,
        data: JSON.stringify(document),
        status: "draft",
      },
    });

    return NextResponse.json({ document, id: saved.id });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
