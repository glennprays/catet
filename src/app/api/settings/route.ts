import { forward } from "@/lib/api/proxy";

export async function GET(request: Request) {
  return forward(request, "/api/v1/settings");
}

export async function PUT(request: Request) {
  return forward(request, "/api/v1/settings");
}
