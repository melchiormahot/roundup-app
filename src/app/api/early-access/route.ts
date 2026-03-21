import { NextResponse } from "next/server";
import { db } from "@/db";
import { earlyAccess } from "@/db/schema";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const { email, country } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // Check for duplicate
    const existing = db.query.earlyAccess.findFirst({
      where: (e, { eq }) => eq(e.email, email),
    }).sync();

    if (existing) {
      return NextResponse.json({ message: "You're already on the list!", duplicate: true });
    }

    db.insert(earlyAccess).values({
      id: nanoid(),
      email,
      country: country || null,
      createdAt: new Date().toISOString(),
    }).run();

    return NextResponse.json({ message: "You're on the list! We'll be in touch.", success: true });
  } catch (err) {
    console.error("Early access error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
