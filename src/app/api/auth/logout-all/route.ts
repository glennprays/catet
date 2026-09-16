import { forward } from "@/lib/api/proxy";
import { clearSessionCookie } from "@/lib/session";

/**
 * The epoch bump on the backend already invalidated this browser's
 * token, so the cookie is cleared too — keeping it would only buy a
 * confusing 401 on the next navigation.
 */
export async function POST(request: Request) {
  const response = await forward(request, "/api/v1/auth/logout-all");
  await clearSessionCookie();
  return response;
}
