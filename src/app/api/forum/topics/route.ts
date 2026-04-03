import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendDiscordWebhook } from "@/lib/discordWebhook";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { title, content, categoryId } = await req.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const topic = await prisma.forumTopic.create({
      data: {
        title,
        content,
        authorId: user.id,
        categoryId
      }
    });

    const cleanContent = content.substring(0, 150) + (content.length > 150 ? '...' : '');

    const category = await prisma.forumCategory.findUnique({ where: { id: categoryId }});

    // Déclenchement du Webhook Discord
    await sendDiscordWebhook(
      `Nouveau Sujet : ${title}`,
      cleanContent,
      user.name || "Membre",
      user.image || `https://cdn.discordapp.com/embed/avatars/0.png`,
      `http://localhost:3000/forum/topic/${topic.id}`,
      0xFFFFFF, // Blanc pour un nouveau topic !
      category?.name || undefined
    );

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
