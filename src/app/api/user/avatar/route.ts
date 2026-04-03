import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    // Nettoyer l'ancien fichier ? Trop complexe pour ce snippet, on écrase ou crée un unique.
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar_${session.user.email.replace(/[@.]/g, '_')}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/uploads/avatars/${fileName}`;

    // Mettre à jour l'utilisateur en base
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
