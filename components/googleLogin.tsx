"use client";

import { authClient } from "@/lib/auth-client";
import { GoogleLogin } from "@react-oauth/google";

const GoogleLoginPage = () => {
  return (
    <div>
      <GoogleLogin
        onSuccess={async (response) => {
          console.log("GOOGLE RESPONSE:", response);

          const accessTokenG = response.credential; 

          if (!accessTokenG) {
            console.error("No ID token found");
            return;
          }

          const data = await authClient.signIn.social({
            provider: "google",
            idToken: {
                accessToken: accessTokenG,
                token: ""
            }
          });

          console.log("AUTH CLIENT RESPONSE:", data);
        }}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
};

export default GoogleLoginPage;
