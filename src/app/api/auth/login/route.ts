import { forwardWithSession } from "@/lib/api/proxy";

export async function POST(request: Request) {
  return forwardWithSession(request, "/api/v1/auth/login");
}
