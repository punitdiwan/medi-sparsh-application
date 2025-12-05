// import { auth } from "@/lib/auth";

// // export const GET = (req: Request) => auth.handler(req);
// // export const POST = (req: Request) => auth.handler(req);
// // export const PUT = (req: Request) => auth.handler(req);
// // export const DELETE = (req: Request) => auth.handler(req);


// export const GET = auth.handler;
// export const POST = auth.handler;
// export const PUT = auth.handler;
// export const DELETE = auth.handler; 
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);