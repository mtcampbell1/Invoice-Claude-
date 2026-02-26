import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserPerms } from "@/lib/tokens";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permissions
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const perms = getUserPerms({
    plan: user.plan,
    tokenPackPurchased: user.tokenPackPurchased,
  });

  if (!perms.canUploadLogo) {
    return NextResponse.json(
      { error: "Upgrade to a paid plan to upload a business logo" },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("logo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use PNG, JPG, SVG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 2 MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `logo-${session.user.id}-${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filepath = path.join(uploadDir, filename);
  const logoUrl = `/uploads/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Remove old logo file if exists
  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
  });
  if (business?.logoUrl?.startsWith("/uploads/")) {
    const oldPath = path.join(process.cwd(), "public", business.logoUrl);
    try {
      await unlink(oldPath);
    } catch {
      // Old file may not exist
    }
  }

  // Update business record
  await prisma.business.upsert({
    where: { userId: session.user.id },
    update: { logoUrl },
    create: {
      userId: session.user.id,
      name: user.name || "My Business",
      logoUrl,
    },
  });

  return NextResponse.json({ logoUrl });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
  });

  if (business?.logoUrl?.startsWith("/uploads/")) {
    const oldPath = path.join(process.cwd(), "public", business.logoUrl);
    try {
      await unlink(oldPath);
    } catch {
      // File may not exist
    }
  }

  if (business) {
    await prisma.business.update({
      where: { userId: session.user.id },
      data: { logoUrl: null },
    });
  }

  return NextResponse.json({ success: true });
}
