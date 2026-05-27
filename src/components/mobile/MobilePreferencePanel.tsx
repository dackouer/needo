import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { useI18n } from "../../i18n/I18nProvider";
import { languages, type Language } from "../../i18n/translations";
import { cn } from "../../lib/utils";
import { useClientTheme } from "../../theme/ClientThemeProvider";

type MobilePortal = "user" | "merchant" | "technician";

const portalEntries: Array<{ key: MobilePortal; label: string; caption: string; to: string }> = [
  { key: "user", label: "用户端", caption: "预约、动态、信息", to: "/" },
  { key: "merchant", label: "商户端", caption: "门店、日程、通讯录", to: "/merchant" },
  { key: "technician", label: "技师端", caption: "任务、日程、收入", to: "/technician" }
];

export function MobilePreferencePanel({
  caption = "客户端白天/黑夜与三语切换集中在这里",
  currentPortal = "user"
}: {
  caption?: string;
  currentPortal?: MobilePortal;
}) {
  const { language, setLanguage } = useI18n();
  const { theme, setTheme } = useClientTheme();

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-black">显示与语言</h2>
          <p className="mt-1 text-xs text-ink/50">{caption}</p>
        </div>
        <Badge tone={theme === "night" ? "yellow" : "green"}>{theme === "night" ? "黑夜" : "白天"}</Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-paper p-3">
        <div>
          <p className="text-xs font-bold text-ink/50">昼夜模式</p>
          <strong className="mt-1 block">{theme === "day" ? "白天模式" : "黑夜模式"}</strong>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            {theme === "day" ? "清爽浅色界面" : "沉浸深色界面"}
          </p>
        </div>
        <button
          className={cn(
            "theme-orbit-toggle focus-ring relative grid h-16 w-32 shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-line p-1 shadow-panel transition",
            theme === "night" && "is-night"
          )}
          onClick={() => setTheme(theme === "day" ? "night" : "day")}
          aria-label="切换白天黑夜模式"
          type="button"
        >
          <span className="theme-orbit-thumb absolute top-1 h-14 w-[calc(50%-4px)] rounded-md transition" />
          <span className="relative z-10 grid place-items-center rounded-md" aria-hidden="true">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="5.5" stroke="currentColor" strokeWidth="2.3" />
              <path
                d="M16 3.5v3M16 25.5v3M3.5 16h3M25.5 16h3M7.2 7.2l2.1 2.1M22.7 22.7l2.1 2.1M24.8 7.2l-2.1 2.1M9.3 22.7l-2.1 2.1"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.2"
              />
            </svg>
          </span>
          <span className="relative z-10 grid place-items-center rounded-md" aria-hidden="true">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 32 32">
              <path
                d="M22.8 22.3c-7.7.7-13.1-4.7-12.4-12.4.2-2 .9-3.9 2-5.5C7.4 5.8 4 10.2 4 15.5 4 22.4 9.6 28 16.5 28c5.3 0 9.7-3.4 11.1-8.4a12 12 0 0 1-4.8 2.7Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="2.3"
              />
              <path d="M21.5 6.5h4M23.5 4.5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </span>
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-ink/50">语言</p>
        <div className="mt-2 grid grid-cols-3 gap-2" data-no-i18n>
          {languages.map((item) => (
            <button
              className={cn(
                "focus-ring rounded-lg border px-2 py-3 text-center text-xs font-black transition",
                language === item.code ? "border-moss bg-moss text-white" : "border-line bg-paper text-ink/60"
              )}
              key={item.code}
              onClick={() => setLanguage(item.code as Language)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-paper p-3">
        <div>
          <p className="text-xs font-bold text-ink/50">端口切换</p>
          <strong className="mt-1 block">用户端 / 商户端 / 技师端</strong>
          <p className="mt-1 text-xs leading-5 text-ink/55">已开通资格的账号可以在这里切换，不再分散到其他入口。</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {portalEntries.map((entry) => {
            const active = currentPortal === entry.key;

            return (
              <Link
                className={cn(
                  "focus-ring rounded-lg border px-2 py-3 text-center transition",
                  active ? "border-moss bg-moss text-white shadow-soft" : "border-line bg-white text-ink"
                )}
                key={entry.key}
                to={entry.to}
              >
                <strong className="block text-sm">{entry.label}</strong>
                <span className={cn("mt-1 block text-[11px] leading-4", active ? "text-white/70" : "text-ink/50")}>{entry.caption}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
