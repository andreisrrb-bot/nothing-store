import { NextResponse } from "next/server";

const CLIENT_ID = "1489435411054072018";
const REDIRECT_URI = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "") + "/api/discord/oauth"; // Adresse dynamique

export async function GET() {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  return NextResponse.redirect(discordAuthUrl);
}
