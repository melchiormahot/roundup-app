export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return Response.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // In a production app, this would save to a database
    // For now, we just acknowledge the submission
    console.log(`[Early Access] New signup: ${email}`);

    return Response.json(
      { message: 'You are on the list! We will be in touch soon.' },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
