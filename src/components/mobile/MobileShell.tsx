import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useClientTheme } from "../../theme/ClientThemeProvider";
import { MobileNavIcon } from "./MobileNavIcon";
import { userNavItems } from "./navItems";

export interface MobileNavItem {
  label: string;
  to: string;
  icon: string;
  featured?: boolean;
}

export function MobileShell({
  children,
  dark = false,
  navItems = userNavItems,
  className
}: {
  children: ReactNode;
  dark?: boolean;
  navItems?: MobileNavItem[];
  className?: string;
}) {
  const { isNight } = useClientTheme();
  const featuredItem = navItems.find((item) => item.featured);
  const normalItems = navItems.filter((item) => !item.featured);
  const splitIndex = featuredItem ? Math.floor(normalItems.length / 2) : normalItems.length;
  const visibleItems = featuredItem
    ? [...normalItems.slice(0, splitIndex), null, ...normalItems.slice(splitIndex)]
    : normalItems;

  return (
    <div
      className={cn(
        "client-shell min-h-screen pb-20",
        isNight ? "client-theme-night bg-ink text-white" : "client-theme-day bg-paper text-ink",
        className
      )}
    >
      <main className="mx-auto min-h-screen w-full max-w-[480px]">{children}</main>
      <nav
        className={cn(
          "client-bottom-nav fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 px-3 pb-1.5 pt-2 backdrop-blur-xl",
          isNight
            ? "border-t border-white/10 bg-[#101816]/95 text-white shadow-[0_-18px_42px_rgba(0,0,0,0.42)]"
            : "border-t border-white/70 bg-[#f7fbf6]/95 text-ink shadow-[0_-18px_42px_rgba(18,51,44,0.12)]"
        )}
      >
        {featuredItem && (
          <NavLink
            className={({ isActive }) =>
              cn(
                "client-featured-nav focus-ring absolute -top-6 left-1/2 z-20 flex h-[68px] w-[68px] -translate-x-1/2 flex-col items-center justify-center rounded-full border-[5px] text-[10px] font-black shadow-soft transition",
                isNight
                  ? "border-[#050505] bg-gradient-to-br from-[#fff0ad] via-[#d9ae4f] to-[#74561e] text-[#070706]"
                  : "border-[#f4f4f0] bg-gradient-to-br from-[#ffe69b] via-[#d5aa4b] to-[#806024] text-[#080806]",
                isActive && (isNight ? "from-[#fff8d4] via-[#f0ce78] to-[#a77d2e] text-[#070706]" : "from-[#fff5c8] via-[#e8c46c] to-[#9a7328] text-[#080806]"),
                "after:absolute after:inset-1 after:rounded-full after:border after:border-white/25 after:content-['']"
              )
            }
            to={featuredItem.to}
          >
            <span className="mobile-nav-icon relative z-10 grid h-7 w-7 place-items-center">
              <MobileNavIcon name={featuredItem.icon} />
            </span>
            <span className="relative z-10 -mt-0.5">{featuredItem.label}</span>
          </NavLink>
        )}
        <div
          className={cn(
            "grid gap-1 rounded-lg border p-1",
            isNight ? "border-white/10 bg-white/[0.08]" : "border-white/80 bg-white/60"
          )}
          style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}
        >
          {visibleItems.map((item, index) => (
            item ? (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "focus-ring flex min-h-[50px] flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold transition",
                    isActive
                      ? isNight
                        ? "bg-white/[0.10] text-[#e8c46c] shadow-[inset_0_0_0_1px_rgba(232,196,108,0.18)]"
                        : "bg-[#f7efd9] text-[#8d6925] shadow-[0_8px_20px_rgba(93,68,20,0.13)]"
                      : isNight
                        ? "text-white/60 hover:bg-white/[0.08] hover:text-white"
                        : "text-ink/50 hover:bg-white/80 hover:text-ink"
                  )
                }
                end={item.to === "/" || item.to === "/merchant" || item.to === "/technician"}
                key={item.to}
                to={item.to}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "mobile-nav-icon grid h-6 w-6 place-items-center rounded-full transition",
                        isActive
                          ? isNight
                            ? "bg-[#e8c46c]/[0.16] text-[#e8c46c]"
                            : "bg-[#b68d39]/10 text-[#8d6925]"
                          : "text-current"
                      )}
                    >
                      <MobileNavIcon name={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <span aria-hidden="true" key={`needo-space-${index}`} />
            )
          ))}
        </div>
      </nav>
    </div>
  );
}
