import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import styles from "./profile.module.css";
import SignOutButton from "../../components/SignOutButton";
import ProfileTabs from "./ProfileTabs";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      orders: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className={styles.container}>
      <header className={styles.headerArea}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Client Portal.</h1>
          <p className={styles.subtitle}>Connected as: {user?.email}</p>
        </div>
        <SignOutButton />
      </header>
      
      <ProfileTabs user={user} />
    </div>
  );
}
