import { forward } from "@/lib/api/proxy";

// Static segment: Next resolves /api/bills/payments here, never into
// the [id] route, so "payments" is not read as a bill id.
export async function GET(request: Request) {
  return forward(request, `/api/v1/bills/payments${new URL(request.url).search}`);
}
