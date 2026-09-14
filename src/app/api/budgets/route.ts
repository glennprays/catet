import { forward } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return forward(request, `/api/v1/budgets${new URL(request.url).search}`);
}

export async function POST(request: Request) {
  return forward(request, "/api/v1/budgets");
}
