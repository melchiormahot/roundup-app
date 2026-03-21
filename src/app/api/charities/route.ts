import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  const charities = db.query.charities.findMany().sync();
  return NextResponse.json({ charities });
}
