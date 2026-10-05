"use client";

import { useState } from "react";
import { Cloud } from "lucide-react";
import { createOnlineAccount, deleteOnlineAccount, signOutOnline, updateOnlineEmail } from "@/lib/accountClient";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { uiActions } from "@/lib/ui";
import { Button } from "../ui/Button";
import { T } from "../T";

const inputCls = "h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-emerald";

/** Save the map to the server so it follows the visitor to other devices. */
export function AccountSection() {
  const { account } = useStore();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const emailOk = email.trim() === "" || /.+@.+\..+/.test(email.trim());

  const run = async (fn: () => Promise<{ error: string } | unknown>) => {
    setBusy(true);
    setError("");
    const r = (await fn()) as { error?: string };
    setBusy(false);
    if (r?.error) setError(r.error);
    return r;
  };

  const create = async () => {
    const r = (await run(() => createOnlineAccount(email.trim()))) as { ok?: boolean };
    if (r.ok) {
      setEmail("");
      uiActions.toast("Your map is saved online");
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-line bg-card p-4 shadow-soft md:p-5" aria-labelledby="account-title">
      <h2 id="account-title" className="flex items-center gap-2 font-semibold"><Cloud className="size-4" /> <T>Save my map online</T></h2>

      {!account ? (
        <>
          <p className="mt-1 text-sm text-muted"><T>Keep your map, marks, trips and settings online so you can open them on another device. No password. An email is optional.</T></p>
          <label className="mt-3 block text-sm font-medium">
            {t("Email")} <span className="font-normal text-muted">({t("optional")})</span>
            <input maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" aria-invalid={!emailOk} className={`${inputCls} mt-1 aria-[invalid=true]:border-red-500`} />
          </label>
          {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
          <Button className="mt-3" disabled={busy || !emailOk} onClick={create}>{busy ? t("Saving…") : t("Save my map online")}</Button>
          <p className="mt-2 text-xs text-muted"><T>Without an email you can only open the map on this device. Add an email to sign in elsewhere.</T> <T>Anyone who knows this email can open this online map, so keep only travel details here.</T></p>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted"><T>Your map is saved online and updates automatically.</T> {account.email ? <span className="font-medium text-ink">{account.email}</span> : <T>No email added yet.</T>}</p>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              const r = (await run(() => updateOnlineEmail(email.trim()))) as { ok?: boolean };
              if (r.ok) {
                setEmail("");
                uiActions.toast("Email saved");
              }
            }}
          >
            <input maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder={account.email ? t("Change email") : t("Add email")} aria-label={t("Email")} aria-invalid={!emailOk} className={`${inputCls} flex-1 aria-[invalid=true]:border-red-500`} />
            <Button type="submit" variant="secondary" disabled={busy || !emailOk || email.trim() === ""}>{t("Save email")}</Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void signOutOnline().then(() => uiActions.toast("Signed out of online sync"))}>{t("Sign out of online sync")}</Button>
            {!confirmDelete ? (
              <Button variant="secondary" onClick={() => setConfirmDelete(true)}>{t("Delete my online account")}</Button>
            ) : (
              <Button
                onClick={async () => {
                  const r = (await run(() => deleteOnlineAccount())) as { ok?: boolean };
                  if (r.ok) uiActions.toast("Online account deleted. Your map stays on this device.");
                  setConfirmDelete(false);
                }}
              >
                {t("Yes, delete it")}
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
