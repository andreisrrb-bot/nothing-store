import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature!, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Traitement en fonction de l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.metadata?.orderId) {
      // Valider la commande
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: { status: "COMPLETED" }
      });
      console.log(`Commande ${session.metadata.orderId} validée avec succès !`);
    }
  }

  return NextResponse.json({ received: true });
}
