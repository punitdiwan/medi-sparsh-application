import { auth } from "@/lib/auth";

export const POST = async (req: Request) => {
  return auth.handler(
    new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(await req.json()),
    })
  );
};

// Prevent other HTTP methods
export const GET = () => new Response('Method not allowed', { status: 405 });
export const PUT = () => new Response('Method not allowed', { status: 405 });
export const DELETE = () => new Response('Method not allowed', { status: 405 });
