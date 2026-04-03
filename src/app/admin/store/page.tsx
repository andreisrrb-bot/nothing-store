import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AdminProductManager from "../AdminProductManager";
import AdminPromoManager from "./AdminPromoManager";

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function StoreManagerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/forum");
  }

  const allProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { orders: true }
  });

  const allPromos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
           <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Workspace</div>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-1px' }}>Store Manager</h1>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <AdminPromoManager initialPromos={allPromos} />
        <AdminProductManager initialProducts={allProducts} />
      </div>

    </div>
  );
}
