import { authClient } from "@/lib/auth-client";

export const signInWithGoogle = async () => {
   const respones = await authClient.signIn.social({
      provider: "google",
      callbackURL: `/doctor`,
   })
   console.log("Google Sign-In Response:", respones);
}