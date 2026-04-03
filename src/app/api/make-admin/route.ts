import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await prisma.user.update({
      where: { email: "jovicandre@gmail.com" },
      data: { role: "ADMIN" }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Félicitations, ${user.email} est désormais Administrateur. Actualisez votre site, le bouton Admin va apparaître.` 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: "Erreur, vérifiez que le compte existe bien." 
    }, { status: 500 });
  }
}
