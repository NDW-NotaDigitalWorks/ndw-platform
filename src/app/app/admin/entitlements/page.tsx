import { getMyCoreAccessState } from "@/modules/core/server/core-access";
import { getEnabledModules } from "@/modules/registry/registry.queries";
import { redirect } from "next/navigation";
import {
  grantManualEntitlementAction,
  revokeManualEntitlementAction,
} from "./actions";

export default async function AdminEntitlementsPage() {
  const access = await getMyCoreAccessState();

  if (access.profile?.role?.trim().toLowerCase() !== "owner") {
    redirect("/app?access-denied=1");
  }

  const modules = getEnabledModules();

  return (
    <section>
      <h1>Admin Entitlements</h1>
      <p style={{ color: "#64748b" }}>
        Attiva o revoca manualmente l’accesso ai moduli.
      </p>

      <div style={{ marginTop: 32, display: "grid", gap: 24 }}>
        <form
          action={grantManualEntitlementAction}
          style={{
            padding: 20,
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            background: "#ffffff",
          }}
        >
          <h2>Attiva accesso</h2>

          <label>
            User ID
            <br />
            <input
              name="userId"
              required
              placeholder="uuid utente"
              style={{ width: "100%", padding: 8, marginTop: 8 }}
            />
          </label>

          <br />
          <br />

          <label>
            Modulo
            <br />
            <select name="moduleKey" required style={{ padding: 8, marginTop: 8 }}>
              {modules.map((module) => (
                <option key={module.key} value={module.key}>
                  {module.name}
                </option>
              ))}
            </select>
          </label>

          <br />
          <br />

          <label>
            Piano
            <br />
            <select name="planCode" required style={{ padding: 8, marginTop: 8 }}>
              <option value="free">free</option>
              <option value="base">base</option>
              <option value="pro">pro</option>
              <option value="elite">elite</option>
            </select>
          </label>

          <br />
          <br />

          <button type="submit">Attiva</button>
        </form>

        <form
          action={revokeManualEntitlementAction}
          style={{
            padding: 20,
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            background: "#ffffff",
          }}
        >
          <h2>Revoca accesso</h2>

          <label>
            User ID
            <br />
            <input
              name="userId"
              required
              placeholder="uuid utente"
              style={{ width: "100%", padding: 8, marginTop: 8 }}
            />
          </label>

          <br />
          <br />

          <label>
            Modulo
            <br />
            <select name="moduleKey" required style={{ padding: 8, marginTop: 8 }}>
              {modules.map((module) => (
                <option key={module.key} value={module.key}>
                  {module.name}
                </option>
              ))}
            </select>
          </label>

          <br />
          <br />

          <button type="submit">Revoca</button>
        </form>
      </div>
    </section>
  );
}