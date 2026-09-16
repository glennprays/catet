// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { LlmProvider } from "@/lib/api/hooks";

const provider: LlmProvider = {
  source: "dashboard",
  base_url: "https://ai.example.com/v1",
  model: "glm-4",
  vision_model: "",
  timeout_seconds: 8,
  vision_timeout_seconds: 45,
  api_key_set: true,
  api_key_last4: "cdef",
  enabled: true,
};

const updateMutate = vi.fn();

function stubMutation(mutate: ReturnType<typeof vi.fn>) {
  return { mutate, mutateAsync: vi.fn(async () => undefined), isPending: false };
}

vi.mock("@/lib/api/hooks", () => ({
  useMe: () => ({
    data: { id: "u1", is_admin: true },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useLlmProvider: () => ({
    data: provider,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateLlmProvider: () => stubMutation(updateMutate),
  useResetLlmProvider: () => stubMutation(vi.fn()),
  useLlmModels: () => stubMutation(vi.fn()),
  useTestLlmProvider: () => stubMutation(vi.fn()),
}));

vi.mock("@/components/live-region", () => ({
  useAnnounce: () => () => undefined,
}));

const { default: AiProviderPage } = await import("./page");

beforeEach(() => {
  updateMutate.mockClear();
});

describe("Penyedia AI", () => {
  test("masks the installed key and keeps Simpan disabled until something changes", () => {
    render(<AiProviderPage />);

    const key = screen.getByLabelText(/Kunci API/) as HTMLInputElement;
    expect(key.getAttribute("type")).toBe("password");
    expect(key.getAttribute("placeholder")).toBe("••••••••cdef");
    expect(key.value).toBe("");

    expect((screen.getByRole("button", { name: "Simpan" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "glm-4-plus" } });
    expect((screen.getByRole("button", { name: "Simpan" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  test("an untouched key field sends no api_key at all", () => {
    render(<AiProviderPage />);

    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "glm-4-plus" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(updateMutate).toHaveBeenCalledTimes(1);
    const body = updateMutate.mock.calls[0][0] as Record<string, unknown>;
    expect("api_key" in body).toBe(false);
    expect(body.model).toBe("glm-4-plus");
  });

  test("Hapus kunci sends an empty api_key, which turns AI off", () => {
    render(<AiProviderPage />);

    fireEvent.click(screen.getByRole("button", { name: "Hapus kunci" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    expect(updateMutate).toHaveBeenCalledTimes(1);
    const body = updateMutate.mock.calls[0][0] as Record<string, unknown>;
    expect(body.api_key).toBe("");
  });
});
