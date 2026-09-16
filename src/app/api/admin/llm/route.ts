import { forward } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return forward(request, "/api/v1/admin/llm");
}

export async function PUT(request: Request) {
  return forward(request, "/api/v1/admin/llm");
}

export async function DELETE(request: Request) {
  return forward(request, "/api/v1/admin/llm", { method: "DELETE" });
}
