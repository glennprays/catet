// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { QueryBoundary, type BoundaryQuery } from "./query-boundary";

const base: BoundaryQuery<string[]> = {
  isPending: false,
  isError: false,
  data: undefined,
  refetch: () => undefined,
};

function renderBoundary(query: Partial<BoundaryQuery<string[]>>) {
  return render(
    <QueryBoundary
      query={{ ...base, ...query }}
      isEmpty={(data: string[]) => data.length === 0}
      skeleton={<p>memuat</p>}
      empty={<p>kosong</p>}
    >
      {(data: string[]) => <p>{data.join(",")}</p>}
    </QueryBoundary>,
  );
}

describe("QueryBoundary branch order", () => {
  test("pending renders the skeleton", () => {
    renderBoundary({ isPending: true });
    expect(screen.getByText("memuat")).toBeDefined();
  });

  test("error renders a retry that refetches", () => {
    const refetch = vi.fn();
    renderBoundary({ isError: true, refetch });

    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));

    expect(refetch).toHaveBeenCalledOnce();
  });

  test("empty data renders the empty state, not zero rows of data", () => {
    renderBoundary({ data: [] });
    expect(screen.getByText("kosong")).toBeDefined();
  });

  test("data renders children", () => {
    renderBoundary({ data: ["a", "b"] });
    expect(screen.getByText("a,b")).toBeDefined();
  });
});
