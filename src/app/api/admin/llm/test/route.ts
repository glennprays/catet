import { forward } from "@/lib/api/proxy";

export async function POST(request: Request) {
  return forward(request, "/api/v1/admin/llm/test");
}
