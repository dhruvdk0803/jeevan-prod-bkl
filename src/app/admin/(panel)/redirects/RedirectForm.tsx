"use client";
import { useActionState, useState } from "react";
import { Alert, Button, Field, Input, Select } from "@/components/admin/ui";
import { initialActionState } from "@/lib/cms/action-state";
import { saveRedirect } from "./actions";

type Redirect = { id: string; source: string; destination: string; permanent: boolean };

export function RedirectForm({ redirect }: { redirect?: Redirect }) {
  const [state, formAction, pending] = useActionState(saveRedirect, initialActionState);
  const [permanent, setPermanent] = useState(redirect ? String(redirect.permanent) : "true");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirect ? <input type="hidden" name="id" value={redirect.id} /> : null}
      {state.message ? <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert> : null}

      <Field label="From" htmlFor="rd-source" hint="A path on this site, starting with /." error={state.fieldErrors?.source}>
        <Input id="rd-source" name="source" defaultValue={redirect?.source ?? ""} placeholder="/old-page" required aria-invalid={Boolean(state.fieldErrors?.source)} />
      </Field>

      <Field label="To" htmlFor="rd-destination" hint="A path on this site, or an absolute https:// URL." error={state.fieldErrors?.destination}>
        <Input id="rd-destination" name="destination" defaultValue={redirect?.destination ?? ""} placeholder="/new-page" required aria-invalid={Boolean(state.fieldErrors?.destination)} />
      </Field>

      <Field label="Type" htmlFor="rd-permanent">
        <Select id="rd-permanent" value={permanent} onChange={(e) => setPermanent(e.target.value)}>
          <option value="true">301 — Permanent</option>
          <option value="false">302 — Temporary</option>
        </Select>
        {/* the real field the action reads: "on" (checkbox convention) or absent */}
        <input type="hidden" name="permanent" value={permanent === "true" ? "on" : ""} />
      </Field>

      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : redirect ? "Save changes" : "Create redirect"}
        </Button>
      </div>
    </form>
  );
}
