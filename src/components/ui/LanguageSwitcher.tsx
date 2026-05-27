import { cn } from "../../lib/utils";
import { useI18n } from "../../i18n/I18nProvider";
import { languages, type Language } from "../../i18n/translations";

export function LanguageSwitcher({
  compact = false,
  dark = false,
  className
}: {
  compact?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const { language, setLanguage } = useI18n();

  return (
    <div
      aria-label="Language selector"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border p-1 shadow-panel",
        compact && "rounded-full",
        dark ? "border-white/15 bg-white/10 text-white" : "border-line bg-white text-ink",
        className
      )}
      data-no-i18n
    >
      {languages.map((item) => (
        <button
          aria-pressed={language === item.code}
          className={cn(
            "focus-ring h-8 px-2 text-xs font-black transition",
            compact ? "min-w-8 rounded-full" : "min-w-14 rounded-md",
            language === item.code
              ? dark
                ? "bg-white text-ink"
                : "bg-ink text-white"
              : dark
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-ink/55 hover:bg-paper hover:text-ink"
          )}
          key={item.code}
          onClick={() => setLanguage(item.code as Language)}
          title={item.label}
          type="button"
        >
          {compact ? item.shortLabel : item.label}
        </button>
      ))}
    </div>
  );
}
