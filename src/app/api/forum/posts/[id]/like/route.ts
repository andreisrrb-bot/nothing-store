import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const postId = params.id;

    const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Check if like exists
    const existingLike = await prisma.forumPostLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    });

    if (existingLike) {
      await prisma.forumPostLike.delete({ where: { id: existingLike.id } });
      // Retirer 10 XP à l'auteur
      await prisma.user.update({
        where: { id: post.authorId },
        data: { xp: { decrement: 10 } }
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.forumPostLike.create({
        data: { userId: user.id, postId: postId }
      });
      // Donner 10 XP à l'auteur
      await prisma.user.update({
        where: { id: post.authorId },
        data: { xp: { increment: 10 } }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
