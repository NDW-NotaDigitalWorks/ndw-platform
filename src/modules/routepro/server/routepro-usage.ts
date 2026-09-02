import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const ROUTEPRO_MODULE_KEY = "routepro";

const TRIAL_DAYS = 7;
const TRIAL_ROUTE_LIMIT = 5;
const PAID_MONTHLY_ROUTE_LIMIT = 50;

async function isRouteProTrialEnabled(): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("routepro_settings")
    .select("trial_enabled")
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    throw new Error(
      `RoutePro settings lookup failed: ${error.message}`,
    );
  }

  return data?.trial_enabled ?? true;
}

function hashRouteProDeviceId(deviceId: string): string {
  return createHash("sha256")
    .update(deviceId.trim())
    .digest("hex");
}

async function claimRouteProTrialDevice(
  userId: string,
  deviceId: string,
): Promise<"ok" | "already_used"> {
  const supabase = createAdminClient();
  const deviceHash = hashRouteProDeviceId(deviceId);

  const { data: existingDevice, error: lookupError } = await supabase
    .from("routepro_trial_devices")
    .select("user_id")
    .eq("device_hash", deviceHash)
    .maybeSingle();

  if (lookupError) {
    throw new Error(
      `RoutePro trial device lookup failed: ${lookupError.message}`,
    );
  }

  if (existingDevice) {
    return existingDevice.user_id === userId ? "ok" : "already_used";
  }

  const { error: insertError } = await supabase
    .from("routepro_trial_devices")
    .insert({
      user_id: userId,
      device_hash: deviceHash,
    });

  if (!insertError) {
    return "ok";
  }

  /*
   * Potrebbe esserci stata una richiesta concorrente.
   * Ricontrolliamo prima di considerarla un errore reale.
   */
  const { data: concurrentDevice, error: concurrentError } = await supabase
    .from("routepro_trial_devices")
    .select("user_id")
    .eq("device_hash", deviceHash)
    .maybeSingle();

  if (concurrentError) {
    throw new Error(
      `RoutePro trial device verification failed: ${concurrentError.message}`,
    );
  }

  if (concurrentDevice) {
    return concurrentDevice.user_id === userId ? "ok" : "already_used";
  }

  throw new Error(
    `RoutePro trial device creation failed: ${insertError.message}`,
  );
}

type RouteProUsageMode = "owner" | "manual" | "paid" | "trial";

export type RouteProUsageState = {
  allowed: boolean;
  mode: RouteProUsageMode;
  routesUsed: number | null;
  routesLimit: number | null;
  remainingRoutes: number | null;
  expiresAt: string | null;
  reason:
  | "ok"
  | "trial_disabled"
  | "trial_device_required"
  | "trial_device_already_used"
  | "trial_expired"
  | "trial_exhausted"
  | "paid_quota_exhausted"
  | "account_inactive";
};

type AccessContext = {
  mode: RouteProUsageMode;
  accountActive: boolean;
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getCurrentUtcMonthPeriod(now = new Date()): {
  periodStart: string;
  periodEnd: string;
} {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );

  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
  };
}

async function getAccessContext(userId: string): Promise<AccessContext> {
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`RoutePro profile lookup failed: ${profileError.message}`);
  }

  if (!profile?.is_active) {
    return {
      mode: "trial",
      accountActive: false,
    };
  }

  if (String(profile.role ?? "").trim().toLowerCase() === "owner") {
    return {
      mode: "owner",
      accountActive: true,
    };
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("module_entitlements")
    .select("provider,is_active")
    .eq("user_id", userId)
    .eq("module_key", ROUTEPRO_MODULE_KEY)
    .eq("is_active", true)
    .maybeSingle();

  if (entitlementError) {
    throw new Error(
      `RoutePro entitlement lookup failed: ${entitlementError.message}`,
    );
  }

  if (entitlement?.provider === "manual") {
    return {
      mode: "manual",
      accountActive: true,
    };
  }

  if (entitlement?.provider === "whop") {
    return {
      mode: "paid",
      accountActive: true,
    };
  }

  return {
    mode: "trial",
    accountActive: true,
  };
}

async function getOrCreateTrial(userId: string) {
  const supabase = createAdminClient();

  const { data: existingTrial, error: existingError } = await supabase
    .from("routepro_trials")
    .select("id,started_at,expires_at,routes_used,routes_limit,status")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`RoutePro trial lookup failed: ${existingError.message}`);
  }

  if (existingTrial) {
    return existingTrial;
  }

  const now = new Date();
  const expiresAt = addDays(now, TRIAL_DAYS);

  const { data: createdTrial, error: createError } = await supabase
    .from("routepro_trials")
    .insert({
      user_id: userId,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      routes_used: 0,
      routes_limit: TRIAL_ROUTE_LIMIT,
      status: "active",
      updated_at: now.toISOString(),
    })
    .select("id,started_at,expires_at,routes_used,routes_limit,status")
    .single();

  if (createError || !createdTrial) {
    throw new Error(
      `RoutePro trial creation failed: ${createError?.message ?? "unknown error"}`,
    );
  }

  return createdTrial;
}

async function getOrCreatePaidUsage(userId: string) {
  const supabase = createAdminClient();
  const { periodStart, periodEnd } = getCurrentUtcMonthPeriod();

  const { data: existingUsage, error: existingError } = await supabase
    .from("routepro_usage")
    .select("id,period_start,period_end,routes_used,routes_limit")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `RoutePro paid usage lookup failed: ${existingError.message}`,
    );
  }

  if (existingUsage) {
    return existingUsage;
  }

  const { data: createdUsage, error: createError } = await supabase
    .from("routepro_usage")
    .insert({
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      routes_used: 0,
      routes_limit: PAID_MONTHLY_ROUTE_LIMIT,
      updated_at: new Date().toISOString(),
    })
    .select("id,period_start,period_end,routes_used,routes_limit")
    .single();

  if (createError || !createdUsage) {
    throw new Error(
      `RoutePro paid usage creation failed: ${createError?.message ?? "unknown error"}`,
    );
  }

  return createdUsage;
}

export async function getRouteProUsageState(
  userId: string,
  deviceId?: string | null,
): Promise<RouteProUsageState> {
  const access = await getAccessContext(userId);

  if (!access.accountActive) {
    return {
      allowed: false,
      mode: access.mode,
      routesUsed: null,
      routesLimit: null,
      remainingRoutes: null,
      expiresAt: null,
      reason: "account_inactive",
    };
  }

  if (access.mode === "owner" || access.mode === "manual") {
    return {
      allowed: true,
      mode: access.mode,
      routesUsed: null,
      routesLimit: null,
      remainingRoutes: null,
      expiresAt: null,
      reason: "ok",
    };
  }

  if (access.mode === "paid") {
    const usage = await getOrCreatePaidUsage(userId);

    const routesUsed = Number(usage.routes_used ?? 0);
    const routesLimit = Number(
      usage.routes_limit ?? PAID_MONTHLY_ROUTE_LIMIT,
    );

    return {
      allowed: routesUsed < routesLimit,
      mode: "paid",
      routesUsed,
      routesLimit,
      remainingRoutes: Math.max(0, routesLimit - routesUsed),
      expiresAt: usage.period_end,
      reason: routesUsed < routesLimit ? "ok" : "paid_quota_exhausted",
    };
  }

  const supabase = createAdminClient();

const { data: existingTrial, error: existingTrialError } = await supabase
  .from("routepro_trials")
  .select("id")
  .eq("user_id", userId)
  .maybeSingle();

if (existingTrialError) {
  throw new Error(
    `RoutePro existing trial lookup failed: ${existingTrialError.message}`,
  );
}

if (!existingTrial) {
  const trialEnabled = await isRouteProTrialEnabled();

  if (!trialEnabled) {
    return {
      allowed: false,
      mode: "trial",
      routesUsed: null,
      routesLimit: null,
      remainingRoutes: null,
      expiresAt: null,
      reason: "trial_disabled",
    };
  }
}

  const normalizedDeviceId = deviceId?.trim();

  if (!normalizedDeviceId) {
    return {
      allowed: false,
      mode: "trial",
      routesUsed: null,
      routesLimit: null,
      remainingRoutes: null,
      expiresAt: null,
      reason: "trial_device_required",
    };
  }

  const deviceClaim = await claimRouteProTrialDevice(
    userId,
    normalizedDeviceId,
  );

  if (deviceClaim === "already_used") {
    return {
      allowed: false,
      mode: "trial",
      routesUsed: null,
      routesLimit: null,
      remainingRoutes: null,
      expiresAt: null,
      reason: "trial_device_already_used",
    };
  }

const trial = await getOrCreateTrial(userId);

  const routesUsed = Number(trial.routes_used ?? 0);
  const routesLimit = Number(trial.routes_limit ?? TRIAL_ROUTE_LIMIT);
  const expiresAt = new Date(trial.expires_at);
  const now = new Date();

  if (expiresAt.getTime() <= now.getTime()) {
    if (trial.status !== "expired") {
      const supabase = createAdminClient();

      await supabase
        .from("routepro_trials")
        .update({
          status: "expired",
          updated_at: now.toISOString(),
        })
        .eq("id", trial.id);
    }

    return {
      allowed: false,
      mode: "trial",
      routesUsed,
      routesLimit,
      remainingRoutes: Math.max(0, routesLimit - routesUsed),
      expiresAt: trial.expires_at,
      reason: "trial_expired",
    };
  }

  if (routesUsed >= routesLimit) {
    if (trial.status !== "exhausted") {
      const supabase = createAdminClient();

      await supabase
        .from("routepro_trials")
        .update({
          status: "exhausted",
          updated_at: now.toISOString(),
        })
        .eq("id", trial.id);
    }

    return {
      allowed: false,
      mode: "trial",
      routesUsed,
      routesLimit,
      remainingRoutes: 0,
      expiresAt: trial.expires_at,
      reason: "trial_exhausted",
    };
  }

  return {
    allowed: true,
    mode: "trial",
    routesUsed,
    routesLimit,
    remainingRoutes: routesLimit - routesUsed,
    expiresAt: trial.expires_at,
    reason: "ok",
  };
}

export async function consumeRouteProRoute(userId: string): Promise<void> {
  const state = await getRouteProUsageState(userId);

  if (!state.allowed) {
    throw new Error(`RoutePro usage denied: ${state.reason}`);
  }

  if (state.mode === "owner" || state.mode === "manual") {
    return;
  }

  const supabase = createAdminClient();

  if (state.mode === "trial") {
    const currentUsed = state.routesUsed ?? 0;
    const nextUsed = currentUsed + 1;
    const nextStatus =
      state.routesLimit !== null && nextUsed >= state.routesLimit
        ? "exhausted"
        : "active";

    const { data, error } = await supabase
      .from("routepro_trials")
      .update({
        routes_used: nextUsed,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("routes_used", currentUsed)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`RoutePro trial usage update failed: ${error.message}`);
    }

    if (!data) {
      throw new Error(
        "RoutePro trial usage changed concurrently. Retry the operation.",
      );
    }

    return;
  }

  const { periodStart } = getCurrentUtcMonthPeriod();
  const currentUsed = state.routesUsed ?? 0;

  const { data, error } = await supabase
    .from("routepro_usage")
    .update({
      routes_used: currentUsed + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .eq("routes_used", currentUsed)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`RoutePro paid usage update failed: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      "RoutePro paid usage changed concurrently. Retry the operation.",
    );
  }
}
