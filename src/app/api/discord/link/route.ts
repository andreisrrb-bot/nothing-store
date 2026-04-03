import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = "1489435411054072018";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const REDIRECT_URI = `${origin}/api/discord/oauth`;
  
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  return NextResponse.redirect(discordAuthUrl);
}
