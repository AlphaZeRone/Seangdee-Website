import { requireAdmin } from "@/lib/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffRoleForm } from "@/components/admin/staff-role-form";
import { Badge, Card } from "@/components/ui";
import {
  PROFILE_ROLE_LABELS,
  type ProfileRole,
} from "@/lib/types";

export const metadata = { title: "จัดการทีมงาน — Seangdee Admin" };

const ROLE_TONE: Record<ProfileRole, "indigo" | "green" | "gray" | "amber"> = {
  admin: "indigo",
  staff: "green",
  customer: "gray",
  pending: "amber",
};

// Sort order for the table: admins first, then staff, customers, pending.
const ROLE_ORDER: Record<string, number> = {
  admin: 0,
  staff: 1,
  customer: 2,
  pending: 3,
};

type Row = {
  id: string;
  email: string;
  full_name: string;
  role: ProfileRole;
  created_at: string;
};

export default async function StaffPage() {
  const { user: me } = await requireAdmin();
  const admin = createAdminClient();

  // Auth users hold the email; profiles hold the role + display name. Merge by id.
  const [authRes, profRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from("profiles")
      .select("id, full_name, role, created_at"),
  ]);

  const profiles = new Map(
    (profRes.data ?? []).map((p) => [p.id, p])
  );

  const rows: Row[] = (authRes.data?.users ?? []).map((u) => {
    const p = profiles.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      full_name: p?.full_name || "—",
      role: (p?.role as ProfileRole) ?? "pending",
      created_at: p?.created_at ?? u.created_at,
    };
  });

  rows.sort(
    (a, b) =>
      (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9) ||
      a.full_name.localeCompare(b.full_name)
  );

  const staffCount = rows.filter(
    (r) => r.role === "admin" || r.role === "staff"
  ).length;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">จัดการทีมงาน</h1>
      <p className="mb-6 text-sm text-slate-500">
        กำหนดบทบาทผู้ใช้ · ผู้ดูแลและพนักงานเข้าถึงหลังบ้านได้ · ลูกค้าเข้าได้เฉพาะหน้าเว็บ
        ({staffCount} คนในทีมงาน จากผู้ใช้ทั้งหมด {rows.length} คน)
      </p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="py-3 pr-4">ผู้ใช้</th>
                <th className="py-3 pr-4">อีเมล</th>
                <th className="py-3 pr-4">บทบาทปัจจุบัน</th>
                <th className="py-3 text-right">เปลี่ยนบทบาท</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    ยังไม่มีผู้ใช้
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const isMe = r.id === me.id;
                return (
                  <tr key={r.id} className="border-b border-slate-100 align-middle">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">
                        {r.full_name}
                        {isMe && (
                          <span className="ml-2 text-xs font-normal text-slate-400">
                            (คุณ)
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{r.email}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={ROLE_TONE[r.role]}>
                        {PROFILE_ROLE_LABELS[r.role]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {isMe ? (
                        <p className="text-right text-xs text-slate-400">
                          เปลี่ยนบทบาทตัวเองไม่ได้
                        </p>
                      ) : (
                        <StaffRoleForm userId={r.id} currentRole={r.role} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
