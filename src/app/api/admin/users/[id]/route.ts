import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Ne pas pouvoir se supprimer soi-même
    if (currentUser.id === params.id) {
       return NextResponse.json({ error: "You cannot ban yourself." }, { status: 400 });
    }

    // Prisma Delete Cascade: Assurez-vous que le schema est en onDelete: Cascade, 
    // ou bien supprimez ses entités enfant manuellement.
    // Par sécurité, supprimons les posts du user explicitement si pas de cascade totale.
    await prisma.forumPost.deleteMany({ where: { authorId: params.id } });
    await prisma.forumTopic.deleteMany({ where: { authorId: params.id } });
    
    // Le reste devrait avoir Cascade dans schema.prisma
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
