export async function sendDiscordWebhook(
  title: string, 
  description: string, 
  authorName: string, 
  authorIcon: string, 
  url: string, 
  color: number = 0x000000,
  categoryName?: string
) {
  const WEBHOOK_URL = "https://discord.com/api/webhooks/1489437881503187096/NcWNbUcw1u4i8Afqjuu41C628RX60eUoZ0YoYlNwhA9smaYkTEka4F7NHppjumh1_ahn";
  
  if (!WEBHOOK_URL) return;

  const safeIcon = authorIcon || "https://cdn.discordapp.com/embed/avatars/0.png";

  const embed: any = {
    title: title || "Notification",
    description: description ? `>>> ${description.replace("<!-- TARGET:TOPIC -->\n", "")}` : "*(Aucun contenu)*",
    url: url || "http://localhost:3000",
    color: color === 0 ? 0x2b2d31 : color,
    author: {
      name: authorName || "Utilisateur Anonyme",
      icon_url: safeIcon
    },
    thumbnail: {
      url: safeIcon
    },
    footer: {
      text: "Nothing Store",
      icon_url: "https://i.imgur.com/8QO94Xf.png" 
    },
    timestamp: new Date().toISOString()
  };

  if (categoryName) {
    embed.fields = [
      { name: "📁 Catégorie", value: categoryName, inline: true }
    ];
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error("Erreur Webhook Discord :", error);
  }
}
