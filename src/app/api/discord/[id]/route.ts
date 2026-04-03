import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const discordId = params.id;

  // Verify if it's a valid Snowflake ID format (all digits, typical 17-19 characters)
  if (!/^\d{17,20}$/.test(discordId)) {
    return NextResponse.json({ error: "Invalid Discord ID format" }, { status: 400 });
  }

  try {
    // Calling an open public API to fetch Discord User data by ID
    const response = await fetch(`https://discordlookup.mesalinc.com/api/users/${discordId}`, {
      headers: {
        'User-Agent': 'NothingStore/1.0',
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // cache for 1 hour to avoid rate limits
    });

    if (!response.ok) {
      return NextResponse.json({ error: "User not found or rate limited" }, { status: response.status });
    }

    const data = await response.json();
    
    // Check if user has an avatar
    if (data.avatar && data.avatar.link) {
      return NextResponse.json({ avatar: data.avatar.link, username: data.global_name || data.username });
    } else {
      // Default discord avatar based on discriminator (or ID for new users)
      const defaultAvatarInt = BigInt(discordId) >> BigInt(22);
      const defaultAvatarId = Number(defaultAvatarInt % BigInt(6));
      return NextResponse.json({ avatar: `https://cdn.discordapp.com/embed/avatars/${Math.abs(defaultAvatarId)}.png`, username: data.global_name || data.username });
    }
    
  } catch (error) {
    // Si l'API publique Discord "mesalinc" est hors-ligne (DNS/ENOTFOUND), 
    // on masque l'erreur serveur et on retourne discrètement un avatar par défaut.
    let defaultAvatarId = 0;
    try {
      const defaultAvatarInt = BigInt(discordId) >> BigInt(22);
      defaultAvatarId = Number(defaultAvatarInt % BigInt(6));
    } catch(e) {}
    
    return NextResponse.json({ 
      avatar: `https://cdn.discordapp.com/embed/avatars/${Math.abs(defaultAvatarId)}.png`, 
      username: "Discord User" 
    });
  }
}
