import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fprofile%2Fedit");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Edit your profile
        </h1>
      </header>
      <ProfileForm initialName={user.name} email={user.email} />
    </main>
  );
}
