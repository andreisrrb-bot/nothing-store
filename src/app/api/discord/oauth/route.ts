import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const CLIENT_ID = "1489435411054072018";
const CLIENT_SECRET = "Av_zNJoq5VzU4fyrYxs-J8qtt-JAEpdq";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const REDIRECT_URI = `${origin}/api/discord/oauth`;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.redirect(new URL("/profile?error=unauthorized", origin));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL("/profile?error=no_code", origin));
    }

    // 1. Echanger le code contre un token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/profile?error=discord_token_failed", origin));
    }

    // 2. Utiliser le token pour récupérer les infos Discord de l'utilisateur
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const discordUser = await userResponse.json();
    if (!discordUser.id) {
      return NextResponse.redirect(new URL("/profile?error=discord_user_failed", origin));
    }

    // Construit l'URL formelle de l'avatar fourni par Discord
    const avatarUrl = discordUser.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordUser.id) >> BigInt(22) % BigInt(6))}.png`;

    // 3. Lier ces vraies infos officielles au compte local actuel du site !
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        discord: discordUser.id,
        image: avatarUrl
      }
    });

    // Retour propre vers le profil
    return NextResponse.redirect(new URL("/profile", origin));
    
  } catch (error) {
    console.error(error);
    const origin = req.nextUrl.origin;
    return NextResponse.redirect(new URL("/profile?error=internal_error", origin));
  }
}
