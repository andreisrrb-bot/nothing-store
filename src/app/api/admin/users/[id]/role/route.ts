import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!currentUser || currentUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Ne pas pouvoir se demote soi-même pour éviter de bloquer le site
    if (currentUser.id === params.id) {
       return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }

    const body = await req.json();
    const newRole = body.role === "ADMIN" ? "ADMIN" : "USER";

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role: newRole }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
