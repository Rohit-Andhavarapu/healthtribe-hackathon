"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { client } from "@healthtribe/api-client/src/client.gen";

export function ApiClientConfig() {
  const { getToken } = useAuth();

  useEffect(() => {
    client.setConfig({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
    });

    const interceptorId = client.interceptors.request.use(async (request: Request) => {
      try {
        let token: string | null = null;
        try {
          token = await getToken();
        } catch (e) {
          console.error("Clerk getToken() failed", e);
        }

        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (err) {
        console.error("Failed to get token for api request", err);
      }
      return request;
    });

    return () => {
      client.interceptors.request.eject(interceptorId);
    };
  }, [getToken]);

  return null;
}
