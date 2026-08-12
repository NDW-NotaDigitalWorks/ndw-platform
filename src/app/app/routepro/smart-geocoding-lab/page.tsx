import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RouteProSmartGeocodingLabClient } from "@/modules/routepro/ui/RouteProSmartGeocodingLabClient";

export default async function RouteProSmartGeocodingLabPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return <RouteProSmartGeocodingLabClient />;
}