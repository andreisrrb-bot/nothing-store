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

    // Nettoyage manuel de sécurité
    await prisma.forumPostLike.deleteMany({ where: { post: { topicId: params.id } } });
    await prisma.forumPost.deleteMany({ where: { topicId: params.id } });
    await prisma.forumTopicUpvote.deleteMany({ where: { topicId: params.id } });

    await prisma.forumTopic.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete topic" }, { status: 500 });
  }
}
