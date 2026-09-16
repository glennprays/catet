import { forward } from "@/lib/api/proxy";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return forward(request, `/api/v1/users/${id}/deactivate`);
}
