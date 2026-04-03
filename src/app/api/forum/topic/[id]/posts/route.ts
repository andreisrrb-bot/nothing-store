import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Récupérer tous les messages d'un Topic (Live Refresh)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const posts = await prisma.forumPost.findMany({
      where: { topicId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { 
          select: { name: true, email: true, image: true, role: true, xp: true, orders: { where: { status: 'COMPLETED' }, select: { id: true } } } 
        },
        likes: true,
        replyTo: {
          select: { id: true, content: true, author: { select: { name: true, email: true } } }
        }
      }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Live Refresh Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
