import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LandingPage from "@/components/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RoundUp: Donate Effortlessly, Save on Taxes",
  description: "Round up every purchase to the nearest euro. The spare change goes to charities you choose. Track your tax deduction in real time. Download your tax package in January.",
  openGraph: {
    title: "RoundUp: Donate Effortlessly, Save on Taxes",
    description: "Round up every purchase to the nearest euro. The spare change goes to charities you choose.",
    type: "website",
    siteName: "RoundUp",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoundUp: Donate Effortlessly, Save on Taxes",
    description: "Round up every purchase to the nearest euro. The spare change goes to charities you choose.",
  },
};

export default async function Home() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
