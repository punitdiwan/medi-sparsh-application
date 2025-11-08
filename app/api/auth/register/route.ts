import { auth } from "@/lib/auth";
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, role } = validation.data;

    // Create a new request for the auth handler
    const authRequest = new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        ...(role && { role }), // Include role if provided
      }),
    });
    console.log(authRequest);
    // Let the auth handler process the request
    const response = await auth.api.signUpEmail({body: {email, password, name}});

    // Get the response status and headers
    const { token, user } = response;
    console.log(token, user);
    const responseData = response;

    // Try to parse the response as JSON, fallback to text if it fails
    let data;
    try {
      data = responseData ? JSON.parse(responseData as any) : {};
    } catch (e) {
      data = { message: responseData };
    }

    // Forward the response from the auth handler
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Prevent other HTTP methods
export const GET = () => new Response('Method not allowed', { status: 405 });
export const PUT = () => new Response('Method not allowed', { status: 405 });
export const DELETE = () => new Response('Method not allowed', { status: 405 });