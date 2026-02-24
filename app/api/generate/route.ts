import { NextResponse, type NextRequest } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deductToken, deductGuestToken, getUserPerms } from "@/lib/tokens";
import { generateDocument } from "@/lib/claude";
import { prisma } from "@/lib/db";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    if (!type || !["invoice", "receipt", "statement"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    let session: Session | null = null;
    try {
      session = await getServerSession(authOptions);
    } catch (authErr) {
      console.warn("Auth check failed (DB may be down), proceeding as guest:", authErr);
    }

    // Token deduction — wrapped so a DB outage doesn't block generation
    try {
      if (session?.user?.id) {
        const success = await deductToken(session.user.id);
        if (!success) {
          return NextResponse.json(
            {
              error:
                "No tokens remaining. Buy a token pack or upgrade your plan to continue.",
            },
            { status: 402 }
          );
        }
      } else {
        const ip = getClientIp(req);
        const result = await deductGuestToken(ip);
        if (!result.allowed) {
          const resetsAt = result.resetsAt.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          return NextResponse.json(
            {
              error: `You've used your 3 free documents for this week. Resets on ${resetsAt}. Sign up for a free account to get more.`,
              resetsAt: result.resetsAt,
            },
            { status: 429 }
          );
        }
      }
    } catch (tokenErr) {
      // DB unreachable — log but allow generation so app isn't fully bricked
      console.warn("Token deduction failed (DB may be down), allowing generation:", tokenErr);
    }

    // Generate document from template
    const document = await generateDocument(data, type);

    // Attach business logo for users on plans that support it
    if (session?.user?.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { business: true },
        });
        const perms = getUserPerms({
          plan: user?.plan ?? "free",
          tokenPackPurchased: user?.tokenPackPurchased ?? false,
        });
        if (perms.canUploadLogo && user?.business?.logoUrl) {
          document.logoUrl = user.business.logoUrl;
        }
      } catch {
        // Non-fatal: logo won't appear but document is still generated
      }
    }

    // Save to database for logged-in users only
    if (session?.user?.id) {
      try {
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
      } catch (saveErr) {
        console.warn("Failed to save document to DB:", saveErr);
        // Still return the generated document even if save fails
      }
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate document. Please try again." },
      { status: 500 }
    );
  }
}
