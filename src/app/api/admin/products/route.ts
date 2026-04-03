import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Récupérer le FormData (qui inclut l'image complexe et le texte)
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const rawPrice = parseFloat(formData.get("price") as string);
    const price = Math.round(rawPrice * 100); // Stripe attend le montant en centimes
    const downloadUrl = formData.get("downloadUrl") as string;
    
    let imageUrl = null;
    const imageFile = formData.get("image") as File | null;

    if (!name || !description || isNaN(price)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (imageFile && imageFile.name) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const fileName = Date.now() + "_" + imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      
      // Essayer de créer le dossier récursivement
      try {
        await fs.access(uploadDir);
      } catch (e) {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      imageUrl = `/uploads/products/${fileName}`;
    }

    // Sauvegarde en Base
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        downloadUrl
      }
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Erreur création produit:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
