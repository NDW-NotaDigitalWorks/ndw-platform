import { createClient } from "@/lib/supabase/server";

export type CoreUserRole = "owner" | "admin" | "user";

export type CoreAccessState = {
  isAuthenticated: boolean;
  isActiveAccount: boolean;
  user: {
    id: string;
    email: string | null;
  } | null;
  profile: {
    id: string;
    email: string | null;
    role: CoreUserRole;
    isActive: boolean;
  } | null;
};

export async function getMyCoreAccessState(): Promise<CoreAccessState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      isActiveAccount: false,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,role,is_active")
    .eq("id", user.id)
    .single();

  return {
    isAuthenticated: true,
    isActiveAccount: Boolean(profile?.is_active),
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          role: profile.role as CoreUserRole,
          isActive: profile.is_active,
        }
      : null,
  };
}