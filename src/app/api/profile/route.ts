import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = updateProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid profile details.",
      },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        ...(parsed.data.imageUrl !== undefined && {
          imageUrl: parsed.data.imageUrl,
        }),
      },
      select: { id: true, name: true, email: true, imageUrl: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json(
      { error: "Unable to update your profile right now." },
      { status: 500 }
    );
  }
}
