import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { hashSync } from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    }).sync();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const id = nanoid();
    const passwordHash = hashSync(password, 10);
    const referralCode = nanoid(8).toUpperCase();

    db.insert(users)
      .values({
        id,
        email,
        passwordHash,
        name,
        referralCode,
        createdAt: new Date().toISOString(),
      })
      .run();

    const session = await getSession();
    session.userId = id;
    session.email = email;
    session.name = name;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, userId: id });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
