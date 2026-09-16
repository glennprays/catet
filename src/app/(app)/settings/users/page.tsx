"use client";

import { useState } from "react";
import { Mail, ShieldAlert, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { ListRow } from "@/components/list-row";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueryBoundary } from "@/components/query-boundary";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowMenu } from "@/components/row-menu";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import {
  useCreateInvite,
  useInvites,
  useMe,
  useRevokeInvite,
  useSetUserActive,
  useUsers,
  type Invite,
  type User,
} from "@/lib/api/hooks";
import { dateTimeLabel } from "@/lib/time";
import { toastError } from "@/lib/toast";

/** Row skeletons in the final geometry (DESIGN.md §4 truthfulness law). */
function RowSkeleton({ rows }: { rows: number }) {
  return (
    <Panel density="list">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="catet-shimmer m-2 h-9 rounded-md" />
      ))}
    </Panel>
  );
}

export default function UsersPage() {
  const me = useMe();
  const [inviteOpen, setInviteOpen] = useState(false);

  const isAdmin = me.data?.is_admin === true;

  return (
    <>
      <PageHeader
        title="Users"
        actions={
          isAdmin ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" strokeWidth={1.75} /> Undang pengguna
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-2.5 py-2.5">
        <QueryBoundary
          query={me}
          errorMessage="Akun gagal dimuat."
          skeleton={<RowSkeleton rows={4} />}
          empty={null}
        >
          {(account) =>
            account.is_admin ? (
              <>
                <UsersPanel meId={account.id} />
                <InvitesPanel />
              </>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                heading="Khusus admin"
                caption="Halaman ini hanya untuk admin."
              />
            )
          }
        </QueryBoundary>
      </div>

      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}

function UsersPanel({ meId }: { meId: string }) {
  const users = useUsers();
  const setActive = useSetUserActive();
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);

  function activate(user: User) {
    setActive.mutate(
      { id: user.id, active: true },
      {
        onSuccess: () => toast.success("Akun diaktifkan"),
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <>
      <QueryBoundary
        query={users}
        errorMessage="Pengguna gagal dimuat."
        skeleton={<RowSkeleton rows={4} />}
        empty={null}
      >
        {(list) => (
          <Panel density="list" title="Pengguna" caption={`${list.length} akun`}>
            <div className="hidden h-8 grid-cols-[minmax(0,1fr)_96px_40px] items-center border-b border-border px-4 text-label font-medium uppercase text-ash md:grid">
              <span>Nama · Nomor</span>
              <span>Status</span>
              <span />
            </div>
            <ul aria-label="Pengguna">
              {list.map((user) => {
                const active = user.deactivated_at === null || user.deactivated_at === undefined;
                // The backend refuses both cases, so offering the action
                // would be a lie: never for this account, never for an admin.
                const canDeactivate = active && user.id !== meId && !user.is_admin;
                return (
                  <li key={user.id}>
                    <ListRow
                      title={user.display_name}
                      caption={user.phone}
                      trailing={
                        <div className="grid grid-cols-[96px_40px] items-center">
                          <StatusBadge tone={active ? "safe" : "neutral"}>
                            {active ? "Aktif" : "Nonaktif"}
                          </StatusBadge>
                          {active && !canDeactivate ? (
                            <span />
                          ) : (
                            <RowMenu
                              label={`Aksi ${user.display_name}`}
                              actions={
                                active
                                  ? [
                                      {
                                        label: "Nonaktifkan",
                                        tone: "danger",
                                        onClick: () => setDeactivateTarget(user),
                                      },
                                    ]
                                  : [
                                      {
                                        label: "Aktifkan",
                                        pending: setActive.isPending,
                                        onClick: () => activate(user),
                                      },
                                    ]
                              }
                            />
                          )}
                        </div>
                      }
                    />
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}
      </QueryBoundary>

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title={`Nonaktifkan ${deactivateTarget?.display_name ?? "akun"}?`}
        description={`${deactivateTarget?.phone ?? "Nomor ini"} tidak bisa masuk lagi dan pesan WhatsApp-nya diabaikan. Kamu bisa aktifkan lagi kapan saja.`}
        confirmLabel="Nonaktifkan"
        tone="danger"
        pending={setActive.isPending}
        onConfirm={() => {
          if (deactivateTarget === null) {
            return;
          }
          setActive.mutate(
            { id: deactivateTarget.id, active: false },
            {
              onSuccess: () => {
                toast.success("Akun dinonaktifkan");
                setDeactivateTarget(null);
              },
              onError: (error) => toastError(error.message),
            },
          );
        }}
      />
    </>
  );
}

function InvitesPanel() {
  const invites = useInvites();
  const revoke = useRevokeInvite();

  function revokeInvite(invite: Invite) {
    revoke.mutate(
      { id: invite.id },
      {
        onSuccess: () => toast.success("Undangan dibatalkan"),
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <QueryBoundary
      query={invites}
      errorMessage="Undangan gagal dimuat."
      skeleton={<RowSkeleton rows={2} />}
      isEmpty={(list) => list.length === 0}
      empty={
        <Panel density="list" title="Undangan terbuka">
          <EmptyState
            icon={Mail}
            heading="Tidak ada undangan terbuka"
            caption="Undangan yang belum dipakai muncul di sini sampai kedaluwarsa."
          />
        </Panel>
      }
    >
      {(list) => (
        <Panel density="list" title="Undangan terbuka" caption={`${list.length} menunggu`}>
          <ul aria-label="Undangan terbuka">
            {list.map((invite) => (
              <li key={invite.id}>
                <ListRow
                  title={invite.phone}
                  caption={`Berlaku sampai ${dateTimeLabel(invite.expires_at)}`}
                  trailing={
                    // Same 40px action cell as the users panel above, so the
                    // two panels share one ⋯ column.
                    <div className="grid w-10 items-center">
                      <RowMenu
                        label={`Aksi undangan ${invite.phone}`}
                        actions={[
                          {
                            label: "Batalkan undangan",
                            tone: "danger",
                            pending: revoke.isPending,
                            onClick: () => revokeInvite(invite),
                          },
                        ]}
                      />
                    </div>
                  }
                />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </QueryBoundary>
  );
}

function InviteSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateInvite();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [initializedFor, setInitializedFor] = useState("closed");

  const sessionKey = open ? "open" : "closed";
  if (initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setPhone("");
    setError(undefined);
  }

  function submit() {
    setError(undefined);
    create.mutate(
      { phone: phone.trim() },
      {
        onSuccess: () => {
          toast.success("Undangan dikirim lewat WhatsApp");
          onOpenChange(false);
        },
        onError: (caught) => {
          // CONFLICT ("nomor sudah terdaftar") and phone validation belong
          // on the input, not in a toast that leaves the field looking fine.
          if (caught instanceof ApiError) {
            const detail = caught.details?.find((item) => item.field === "phone");
            setError(detail?.message ?? caught.message);
            return;
          }
          toastError(caught.message);
        },
      },
    );
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Undang pengguna"
      description="Link pendaftarannya dikirim langsung ke nomor ini lewat WhatsApp — tidak ada link yang bisa kamu salin dari sini."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={create.isPending || phone.trim() === ""}>
            Kirim undangan
          </Button>
        </>
      }
    >
      <FormField label="Nomor WhatsApp" htmlFor="invite-phone" hint="Berlaku 7 hari" error={error}>
        <Input
          id="invite-phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="08123456789"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="tabular-nums"
        />
      </FormField>
    </ResponsiveSheet>
  );
}
