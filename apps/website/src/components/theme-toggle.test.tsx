import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { ThemeToggle } from "./theme-toggle.tsx";

const theme = vi.hoisted(() => ({ setTheme: vi.fn() }));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: theme.setTheme }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("offers light, dark, and system themes and applies the choice", async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);

  await user.click(screen.getByRole("button", { name: "Change theme" }));
  expect(await screen.findByRole("menuitem", { name: "Light" })).toBeInTheDocument();
  expect(screen.getByRole("menuitem", { name: "Dark" })).toBeInTheDocument();

  await user.click(screen.getByRole("menuitem", { name: "Dark" }));
  expect(theme.setTheme).toHaveBeenCalledWith("dark");

  await user.click(screen.getByRole("button", { name: "Change theme" }));
  await user.click(await screen.findByRole("menuitem", { name: "Light" }));
  expect(theme.setTheme).toHaveBeenCalledWith("light");

  await user.click(screen.getByRole("button", { name: "Change theme" }));
  await user.click(await screen.findByRole("menuitem", { name: "System" }));
  expect(theme.setTheme).toHaveBeenCalledWith("system");
});
