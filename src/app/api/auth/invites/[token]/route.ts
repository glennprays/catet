import { forward } from "@/lib/api/proxy";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: Request, { params }: Params) {
  const { token } = await params;
  return forward(request, `/api/v1/auth/invites/${token}`);
}
