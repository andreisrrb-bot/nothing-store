import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserActionsDropdown from "./UserActionsDropdown";
import AdminDeleteContentButton from "./AdminDeleteContentButton";
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user || user.role !== "ADMIN") redirect("/");

  const totalUsers = await prisma.user.count();
  const totalTopics = await prisma.forumTopic.count();
  const totalPosts = await prisma.forumPost.count();
  const totalOrders = await prisma.order.count({ where: { status: "COMPLETED" } });

  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    include: { product: true }
  });
  const totalRevenueCents = completedOrders.reduce((acc, order) => acc + order.product.price, 0);
  const totalRevenue = totalRevenueCents / 100;

  const allUsers = await prisma.user.findMany({
    include: {
      _count: {
        select: { forumPosts: true, orders: true }
      }
    }
  });

  const recentTopics = await prisma.forumTopic.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: { author: true, category: true }
  });

  const recentPosts = await prisma.forumPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: { author: true, topic: true }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>System Control</h1>
          <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '1.1rem' }}>Welcome to the bridge, Commander {user.name}.</p>
        </div>
        <Link href="/" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}>
           Go back to Base
        </Link>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 600 }}>Total Revenue</div>
          <div style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-2px' }}>${totalRevenue.toFixed(2)}</div>
          <div style={{ fontSize: '0.85rem', color: '#22c55e', marginTop: '0.5rem' }}>+ Across {totalOrders} successul orders</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
           <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 600 }}>Registered Users</div>
           <div style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-2px' }}>{totalUsers}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
           <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 600 }}>Forum Activity</div>
           <div style={{ display: 'flex', gap: '2rem' }}>
             <div>
               <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>{totalTopics}</div>
               <div style={{ fontSize: '0.85rem', color: '#666' }}>Topics</div>
             </div>
             <div>
               <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>{totalPosts}</div>
               <div style={{ fontSize: '0.85rem', color: '#666' }}>Replies</div>
             </div>
           </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div>
        <h2 style={{ fontSize: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2rem' }}>Members Directory</h2>
        
        <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1.5rem 1rem', color: '#888', fontWeight: 500, fontSize: '0.9rem' }}>User</th>
                <th style={{ padding: '1.5rem 1rem', color: '#888', fontWeight: 500, fontSize: '0.9rem' }}>Discord Link</th>
                <th style={{ padding: '1.5rem 1rem', color: '#888', fontWeight: 500, fontSize: '0.9rem' }}>Level (XP)</th>
                <th style={{ padding: '1.5rem 1rem', color: '#888', fontWeight: 500, fontSize: '0.9rem' }}>Posts</th>
                <th style={{ padding: '1.5rem 1rem', color: '#888', fontWeight: 500, fontSize: '0.9rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     {u.image ? (
                        <img src={u.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                     ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333' }}></div>
                     )}
                     <div>
                        <div style={{ fontWeight: 600 }}>{u.name || (u.email && u.email.split('@')[0]) || "Unknown"}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{u.email}</div>
                     </div>
                     {u.role === "ADMIN" && <span style={{ marginLeft: '1rem', background: '#fff', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>ADMIN</span>}
                  </td>
                  <td style={{ padding: '1rem', color: u.discord ? '#5865F2' : '#555', fontWeight: 600, fontSize: '0.9rem' }}>
                    {u.discord ? u.discord : 'Not Linked'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    Lv. {Math.floor(Math.sqrt((u.xp || 0) / 150)) + 1} <span style={{color: '#666', fontSize:'0.8rem'}}>({u.xp} XP)</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#aaa', fontSize: '0.9rem' }}>{u._count.forumPosts}</td>
                  <td style={{ padding: '1rem' }}>
                     {/* Client component for Actions */}
                     <UserActionsDropdown userId={u.id} currentRole={u.role} currentName={u.name || u.email || "User"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
         {/* CONTENT MODERATION: TOPICS */}
         <div>
            <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Recent Topics</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {recentTopics.map(topic => (
                  <div key={topic.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                     <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
                        By {topic.author.name || topic.author.email?.split('@')[0] || "Unknown"} in {topic.category.name}
                     </div>
                     <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>{topic.title}</div>
                     <AdminDeleteContentButton type="TOPIC" id={topic.id} previewStr={topic.title} />
                  </div>
               ))}
               {recentTopics.length === 0 && <div style={{ color: '#888', padding: '1rem' }}>No topics found.</div>}
            </div>
         </div>

         {/* CONTENT MODERATION: POSTS */}
         <div>
            <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Recent Posts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {recentPosts.map(post => (
                  <div key={post.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                     <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
                        By {post.author.name || post.author.email?.split('@')[0] || "Unknown"} in Topic "{post.topic.title}"
                     </div>
                     <div style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.content.replace("<!-- TARGET:TOPIC -->\n", "")}
                     </div>
                     <AdminDeleteContentButton type="POST" id={post.id} previewStr={post.content.replace("<!-- TARGET:TOPIC -->\n", "").substring(0, 30)} />
                  </div>
               ))}
               {recentPosts.length === 0 && <div style={{ color: '#888', padding: '1rem' }}>No posts found.</div>}
            </div>
         </div>
      </div>
      
    </div>
  );
}
