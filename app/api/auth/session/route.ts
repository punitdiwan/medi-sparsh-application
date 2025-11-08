import { auth } from "@/lib/auth";

export const GET = async (req: Request) => {
  return auth.handler(
    new Request(req.url, {
      method: 'GET',
      headers: req.headers,
    })
  );
};

// Prevent other HTTP methods
export const POST = () => new Response('Method not allowed', { status: 405 });
export const PUT = () => new Response('Method not allowed', { status: 405 });
export const DELETE = () => new Response('Method not allowed', { status: 405 });
