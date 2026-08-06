"use client";

import { useActionState } from "react";
import { updateUserRole } from "@/lib/actions/staff";
import { ASSIGNABLE_ROLES, PROFILE_ROLE_LABELS } from "@/lib/types";
import { Button, Select } from "@/components/ui";

export function StaffRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateUserRole,
    undefined
  );

  // Only offer roles the schema accepts. If the user is currently 'pending'
  // (legacy), the select still starts on a valid assignable role.
  const defaultRole = ASSIGNABLE_ROLES.includes(
    currentRole as (typeof ASSIGNABLE_ROLES)[number]
  )
    ? currentRole
    : "customer";

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <Select
          name="role"
          defaultValue={defaultRole}
          className="w-40 py-1.5 text-xs"
          aria-label="เปลี่ยนบทบาท"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {PROFILE_ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          variant="secondary"
          disabled={pending}
          className="px-3 py-1.5 text-xs"
        >
          {pending ? "…" : "บันทึก"}
        </Button>
      </div>
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-green-600">{state.success}</p>
      )}
    </form>
  );
}
