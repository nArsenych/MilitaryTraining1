"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldX, Bell, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBlocked: boolean;
  blockExpiry: string | null;
  createdAt: string;
  _count: { warnings: number };
}

interface Props {
  users: AdminUser[];
  total: number;
  page: number;
  search: string;
}

const PAGES = (total: number) => Math.ceil(total / 20);

const AdminUsersTable = ({ users, total, page, search: initialSearch }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [warnModal, setWarnModal] = useState<AdminUser | null>(null);
  const [blockModal, setBlockModal] = useState<AdminUser | null>(null);
  const [warnReason, setWarnReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockDays, setBlockDays] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams({ search, page: String(page), ...params });
    startTransition(() => router.push(`/admin/users?${sp}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search, page: "1" });
  };

  const sendWarn = async () => {
    if (!warnModal || !warnReason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${warnModal.id}/warn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: warnReason }),
      });
      if (!res.ok) throw new Error();
      toast.success("Попередження надіслано");
      setWarnModal(null);
      setWarnReason("");
      router.refresh();
    } catch {
      toast.error("Помилка");
    } finally {
      setLoading(false);
    }
  };

  const sendBlock = async () => {
    if (!blockModal || !blockReason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${blockModal.id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: blockReason, days: blockDays ? parseInt(blockDays, 10) : null }),
      });
      if (!res.ok) throw new Error();
      toast.success("Користувача заблоковано");
      setBlockModal(null);
      setBlockReason("");
      setBlockDays("");
      router.refresh();
    } catch {
      toast.error("Помилка");
    } finally {
      setLoading(false);
    }
  };

  const unblock = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Блокування знято");
      router.refresh();
    } catch {
      toast.error("Помилка");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (r: string) =>
    r === "ADMIN" ? "Адмін" : r === "ORGANIZATION" ? "Організація" : "Клієнт";

  const roleBadge = (r: string) => {
    if (r === "ADMIN") return "bg-red-500/20 text-red-300";
    if (r === "ORGANIZATION") return "bg-blue-500/20 text-blue-300";
    return "bg-white/10 text-white/50";
  };

  return (
    <>
      {/* search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за email або ім'ям..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#3D3A36] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FDAB04]/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#FDAB04] text-black text-sm font-semibold"
        >
          Знайти
        </button>
      </form>

      {/* table */}
      <div className="rounded-2xl bg-[#3D3A36] border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Email / Ім'я</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Роль</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Статус</th>
                <th className="text-left px-5 py-3 text-white/40 font-medium text-xs">Попереджень</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium">{u.email}</p>
                    {u.name && <p className="text-white/40 text-xs mt-0.5">{u.name}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.isBlocked ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                        {u.blockExpiry
                          ? `до ${new Date(u.blockExpiry).toLocaleDateString("uk-UA")}`
                          : "назавжди"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                        Активний
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-white/60">{u._count.warnings}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.role !== "ADMIN" && (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setWarnModal(u); setWarnReason(""); }}
                          className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-colors"
                          title="Попередити"
                        >
                          <Bell size={14} />
                        </button>
                        {u.isBlocked ? (
                          <button
                            onClick={() => unblock(u.id)}
                            disabled={loading}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                            title="Розблокувати"
                          >
                            <Shield size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setBlockModal(u); setBlockReason(""); setBlockDays(""); }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Заблокувати"
                          >
                            <ShieldX size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {PAGES(total) > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-white/40 text-xs">Сторінка {page} з {PAGES(total)}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1 || isPending}
              onClick={() => navigate({ page: String(page - 1) })}
              className="p-1.5 rounded-lg bg-white/8 disabled:opacity-30 hover:bg-white/15 transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              disabled={page >= PAGES(total) || isPending}
              onClick={() => navigate({ page: String(page + 1) })}
              className="p-1.5 rounded-lg bg-white/8 disabled:opacity-30 hover:bg-white/15 transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* warn modal */}
      {warnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#3D3A36] rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-1">Попередження</h2>
            <p className="text-white/40 text-sm mb-4">{warnModal.email}</p>
            <textarea
              value={warnReason}
              onChange={(e) => setWarnReason(e.target.value)}
              placeholder="Причина попередження..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-[#302E2B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FDAB04]/50 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setWarnModal(null)}
                className="px-4 py-2 rounded-xl bg-white/8 text-white/70 text-sm"
              >
                Скасувати
              </button>
              <button
                onClick={sendWarn}
                disabled={loading || !warnReason.trim()}
                className="px-4 py-2 rounded-xl bg-yellow-500 text-black text-sm font-semibold disabled:opacity-50"
              >
                Надіслати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* block modal */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#3D3A36] rounded-2xl border border-white/10 p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-1">Заблокувати користувача</h2>
            <p className="text-white/40 text-sm mb-4">{blockModal.email}</p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Причина блокування..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[#302E2B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FDAB04]/50 resize-none mb-3"
            />
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={blockDays}
                onChange={(e) => setBlockDays(e.target.value)}
                placeholder="Кількість днів (порожньо = назавжди)"
                className="flex-1 px-3 py-2 rounded-xl bg-[#302E2B] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FDAB04]/50"
              />
            </div>
            <p className="text-white/30 text-xs mt-2">
              {blockDays ? `Тимчасово на ${blockDays} дн.` : "Постійне блокування"}
            </p>
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setBlockModal(null)}
                className="px-4 py-2 rounded-xl bg-white/8 text-white/70 text-sm"
              >
                Скасувати
              </button>
              <button
                onClick={sendBlock}
                disabled={loading || !blockReason.trim()}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                Заблокувати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsersTable;
