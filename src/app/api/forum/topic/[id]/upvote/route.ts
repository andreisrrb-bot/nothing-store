import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const topicId = params.id;

    const topic = await prisma.forumTopic.findUnique({ where: { id: topicId }, select: { authorId: true } });
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    // Check if upvote exists
    const existingUpvote = await prisma.forumTopicUpvote.findUnique({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId: topicId
        }
      }
    });

    if (existingUpvote) {
      await prisma.forumTopicUpvote.delete({ where: { id: existingUpvote.id } });
      // Retirer 25 XP à l'auteur
      await prisma.user.update({
        where: { id: topic.authorId },
        data: { xp: { decrement: 25 } }
      });
      return NextResponse.json({ upvoted: false });
    } else {
      await prisma.forumTopicUpvote.create({
        data: { userId: user.id, topicId: topicId }
      });
      // Donner 25 XP à l'auteur
      await prisma.user.update({
        where: { id: topic.authorId },
        data: { xp: { increment: 25 } }
      });
      return NextResponse.json({ upvoted: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
