"use client";

import { useState, type ReactNode } from "react";

/** Segmented email / phone switcher shared by the login and signup panels. */
export function AuthTabs({
  email,
  phone,
}: {
  email: ReactNode;
  phone: ReactNode;
}) {
  const [tab, setTab] = useState<"email" | "phone">("email");

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={
            tab === "email"
              ? "rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm"
              : "rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          }
        >
          อีเมล
        </button>
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={
            tab === "phone"
              ? "rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm"
              : "rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          }
        >
          เบอร์โทรศัพท์
        </button>
      </div>

      {tab === "email" ? email : phone}
    </div>
  );
}
