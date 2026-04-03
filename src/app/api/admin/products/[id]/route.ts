import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Note: Pour une suppression ultra propre, il faudrait utiliser "fs.unlink" pour supprimer
    // aussi l'image du disque, mais on va faire au plus simple et sécurisé pour l'instant (suppression DB).
    // Si le produit a des "Orders" associés, la DB crachera une contrainte si pas de Cascade. 
    // Mieux vaut juste nullifier les orders s'il faut, ou refuser de delete un produit acheté.
    
    // Par précaution, s'il a déjà été acheté, on devrait juste le cacher, mais on procède 
    // à une destruction forte comme demandé pour l'administration "Nothing".
    await prisma.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    // Si erreur (ex: contrainte de clé étrangère avec Orders), on catch
    return NextResponse.json({ error: "Cannot delete product. Has it been purchased?" }, { status: 400 });
  }
}
