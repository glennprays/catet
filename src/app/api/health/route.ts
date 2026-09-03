import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import type { components } from "@/lib/api/schema";

type HealthEnvelope = components["schemas"]["HealthEnvelope"];

export async function GET() {
  const envelope = await backendFetch<HealthEnvelope>("/api/v1/health");

  return NextResponse.json(envelope);
}
