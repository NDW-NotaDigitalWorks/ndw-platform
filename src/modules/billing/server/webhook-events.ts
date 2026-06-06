import { createAdminClient } from "@/lib/supabase/admin";

export async function hasWebhookBeenProcessed(
  webhookId: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("billing_webhook_events")
    .select("id")
    .eq("webhook_id", webhookId)
    .maybeSingle();

  return Boolean(data);
}

export async function markWebhookProcessed(params: {
  webhookId: string;
  provider: string;
  eventType?: string | null;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("billing_webhook_events")
    .insert({
      webhook_id: params.webhookId,
      provider: params.provider,
      event_type: params.eventType ?? null,
    });

  if (error) {
    throw new Error(
      `Failed to store webhook event: ${error.message}`,
    );
  }
}