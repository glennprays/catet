// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import { AmountInput } from "./amount-input";

function Harness({
  allowNegative = false,
  onChange,
}: {
  allowNegative?: boolean;
  onChange: (minor: number | null) => void;
}) {
  const [minor, setMinor] = useState<number | null>(null);
  return (
    <AmountInput
      id="amount"
      valueMinor={minor}
      allowNegative={allowNegative}
      onChangeMinor={(next) => {
        setMinor(next);
        onChange(next);
      }}
    />
  );
}

describe("AmountInput", () => {
  test("groups thousands while typing and reports minor units", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "1500000" } });

    expect(onChange).toHaveBeenCalledWith(1500000);
    expect((input as HTMLInputElement).value).toBe("1.500.000");
  });

  test("keeps a leading minus when negatives are allowed", () => {
    const onChange = vi.fn();
    render(<Harness allowNegative onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "-50000" } });

    expect(onChange).toHaveBeenCalledWith(-50000);
    expect((input as HTMLInputElement).value).toBe("\u221250.000");
  });

  test("empty input is unknown, not zero", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "25000" } });
    fireEvent.change(input, { target: { value: "" } });

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect((input as HTMLInputElement).value).toBe("");
  });
});
