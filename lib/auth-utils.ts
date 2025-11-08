import { auth } from './auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for password reset
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type AuthResponse = {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
};

export async function registerUser(data: z.infer<typeof registerSchema>): Promise<AuthResponse> {
  try {
    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        status: 400,
        data: validation.error.issues
      };
    }

    // Use BetterAuth's built-in auth handler
    const response = await auth.handler(
      new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        })
      })
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Registration failed',
        status: response.status
      };
    }

    const user = await response.json();
    return { success: true, data: user };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    };
  }
}

export async function loginUser(data: z.infer<typeof loginSchema>): Promise<AuthResponse> {
  try {
    const validation = loginSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        status: 400,
        data: validation.error.issues
      };
    }

    const response = await auth.handler(
      new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        })
      })
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Login failed',
        status: response.status
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    const response = await auth.handler(
      new Request('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Logout failed',
        status: response.status
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    };
  }
}
