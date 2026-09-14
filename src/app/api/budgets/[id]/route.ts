import { forward } from "@/lib/api/proxy";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  return forward(request, `/api/v1/budgets/${id}`);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  return forward(request, `/api/v1/budgets/${id}`, { method: "DELETE" });
}
