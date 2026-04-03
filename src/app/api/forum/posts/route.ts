import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { sendDiscordWebhook } from "@/lib/discordWebhook";

const prisma = new PrismaClient();

// Créer/Modifier un post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    
    // Modification ?
    if (body.postId && body.content) {
       const post = await prisma.forumPost.findUnique({ where: { id: body.postId } });
       if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
       if (post.authorId !== user.id && user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       
       const updated = await prisma.forumPost.update({
          where: { id: body.postId },
          data: { content: body.content }
       });
       return NextResponse.json({ success: true, post: updated });
    }

    // Création
    const { content, topicId, replyToId } = body;
    if (!content || !topicId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    let validReplyToId = null;
    let finalContent = content;

    if (replyToId) {
      if (replyToId === topicId) {
        // L'utilisateur a explicitement cliqué sur Reply sur le Sujet Principal
        finalContent = "<!-- TARGET:TOPIC -->\n" + content;
      } else {
        const parentPost = await prisma.forumPost.findUnique({ where: { id: replyToId } });
        if (parentPost) validReplyToId = parentPost.id;
      }
    }

    const post = await prisma.forumPost.create({
      data: {
        content: finalContent,
        authorId: user.id,
        topicId,
        replyToId: validReplyToId
      }
    });

    // Mettre à jour le topic et inclure ses infos pour le Webhook
    const updatedTopic = await prisma.forumTopic.update({
      where: { id: topicId },
      data: { updatedAt: new Date() },
      include: { category: true }
    });

    const cleanContent = content.substring(0, 150) + (content.length > 150 ? '...' : '');
    
    // Déclenchement du Webhook Discord
    await sendDiscordWebhook(
      `Nouvelle Réponse dans : ${updatedTopic.title}`,
      cleanContent,
      user.name || "Membre",
      user.image || `https://cdn.discordapp.com/embed/avatars/0.png`,
      `http://localhost:3000/forum/topic/${topicId}`,
      0x000000,
      updatedTopic.category?.name || undefined
    );

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}

// Supprimer un post
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');
    if (!postId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Seul l'auteur ou un ADMIN peut le supprimer
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Permissions denied" }, { status: 403 });
    }

    await prisma.forumPost.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { postId, content } = await req.json();
    
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (post?.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: { content }
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
