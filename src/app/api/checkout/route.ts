import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export async function POST(req: NextRequest) {
  try {
    const sessionAuth = await getServerSession(authOptions);
    
    if (!sessionAuth || !sessionAuth.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { productId } = await req.json();

    // Récupérer le produit depuis la BDD
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Créer une commande en attente
    const order = await prisma.order.create({
      data: {
        userId: (sessionAuth.user as any).id,
        productId: product.id,
        status: "PENDING",
      }
    });

    // Créer une session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"], // link inclut Google Pay / Apple Pay sur Stripe
      invoice_creation: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price, // en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?canceled=true`,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
      }
    });

    // Mettre à jour la commande avec l'ID de session Stripe
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
