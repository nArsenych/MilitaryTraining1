import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShieldX } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BlockedPage = async () => {
  const session = await getSession();
  let blockExpiry: Date | null = null;
  let isPermanent = false;

  if (session) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { blockExpiry: true, isBlocked: true },
    });
    if (user?.isBlocked) {
      blockExpiry = user.blockExpiry;
      isPermanent = !user.blockExpiry;
    }
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });

  let blockMessage: string;
  if (isPermanent) {
    blockMessage = "Ваш акаунт заблоковано назавжди адміністрацією платформи.";
  } else if (blockExpiry) {
    blockMessage = `Ваш акаунт тимчасово заблоковано до ${fmt(blockExpiry)}.`;
  } else {
    blockMessage = "Ваш акаунт заблоковано адміністрацією платформи.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#302E2B] px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <div className="p-5 rounded-full bg-red-500/10 border border-red-500/20">
          <ShieldX size={48} className="text-red-400" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-white mb-2">Акаунт заблоковано</h1>
          <p className="text-white/50 text-sm leading-relaxed">{blockMessage}</p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-sm text-white/60 text-left leading-relaxed">
          Якщо ви вважаєте це помилкою або хочете оскаржити рішення, зверніться до адміністрації:
          <br />
          <a
            href="mailto:militarytraining2026@gmail.com"
            className="text-[#FDAB04] hover:underline mt-1 inline-block"
          >
            militarytraining2026@gmail.com
          </a>
        </div>

        <Link
          href="/api/auth/logout"
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Вийти з акаунту
        </Link>
      </div>
    </div>
  );
};

export default BlockedPage;
