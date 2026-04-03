import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { code, discount } = await req.json();

    if (!code || isNaN(discount)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const newPromo = await prisma.promoCode.create({
      data: {
        code,
        discount
      }
    });

    return NextResponse.json({ success: true, promo: newPromo });
  } catch (error: any) {
    console.error("Erreur promo:", error);
    if (error.code === 'P2002') {
       return NextResponse.json({ error: "Ce code promo existe déjà." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create promo" }, { status: 500 });
  }
}
