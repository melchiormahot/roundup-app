import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export default async function Home() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (session.isLoggedIn) {
    redirect('/dashboard');
  }

  // Landing page will be built in Phase H
  // For now, redirect to login
  redirect('/login');
}
