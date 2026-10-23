import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  rpc: vi.fn(),
  signOut: vi.fn(),
}));
const redirectMock = vi.hoisted(() =>
  vi.fn((destination: string) => {
    throw new Error(`redirect:${destination}`);
  }),
);

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: authMocks.getUser,
      signInWithPassword: authMocks.signInWithPassword,
      signOut: authMocks.signOut,
    },
    rpc: authMocks.rpc,
  }),
}));

import { requireAdmin } from "../src/lib/auth/require-admin";
import {
  signInAction,
  signOutAction,
} from "../src/app/admin/login/actions";

describe("administrator session authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated visitors to login", async () => {
    authMocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(requireAdmin()).rejects.toThrow("redirect:/admin/login");
  });

  it("denies authenticated users without the administrator allowlist role", async () => {
    authMocks.getUser.mockResolvedValue({
      data: { user: { id: "user-id" } },
      error: null,
    });
    authMocks.rpc.mockResolvedValue({ data: false, error: null });

    await expect(requireAdmin()).rejects.toThrow("redirect:/");
    expect(authMocks.rpc).toHaveBeenCalledWith("is_admin");
  });

  it("accepts only a session verified by the administrator RPC", async () => {
    const user = { id: "admin-id" };
    authMocks.getUser.mockResolvedValue({ data: { user }, error: null });
    authMocks.rpc.mockResolvedValue({ data: true, error: null });

    await expect(requireAdmin()).resolves.toEqual(user);
  });

  it("clears the server-side Supabase session during logout", async () => {
    authMocks.signOut.mockResolvedValue({ error: null });

    await expect(signOutAction()).rejects.toThrow(
      "redirect:/admin/login",
    );
    expect(authMocks.signOut).toHaveBeenCalledOnce();
  });

  it("signs out a valid Supabase user who is not allowlisted as an admin", async () => {
    authMocks.signInWithPassword.mockResolvedValue({ error: null });
    authMocks.getUser.mockResolvedValue({
      data: { user: { id: "regular-user" } },
      error: null,
    });
    authMocks.rpc.mockResolvedValue({ data: false, error: null });
    authMocks.signOut.mockResolvedValue({ error: null });
    const formData = new FormData();
    formData.set("email", "visitor@example.com");
    formData.set("password", "correct-password");

    await expect(signInAction({}, formData)).resolves.toEqual({
      error: "Sign in failed. Check your credentials and try again.",
    });
    expect(authMocks.signOut).toHaveBeenCalledOnce();
  });
});
