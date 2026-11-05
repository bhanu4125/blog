import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RegistrationBody = {
  name: string;
  email: string;
  password: string;
};

function isRegistrationBody(value: unknown): value is RegistrationBody {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return (
    typeof body.name === "string" &&
    typeof body.email === "string" &&
    typeof body.password === "string"
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!isRegistrationBody(payload)) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  const name = payload.name.trim();
  const email = payload.email.trim().toLowerCase();
  const password = payload.password;

  if (
    name.length < 1 ||
    name.length > 80 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return NextResponse.json(
      {
        error:
          "Provide a name (1–80 characters), a valid email, and a password of 8–72 bytes.",
      },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Unable to create the account right now." },
      { status: 500 }
    );
  }
}
