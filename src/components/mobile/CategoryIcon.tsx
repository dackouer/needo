import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CategoryIconProps {
  id: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-16 w-16"
};

function IconSvg({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <svg aria-hidden={!label} aria-label={label} className="h-[68%] w-[68%]" fill="none" viewBox="0 0 32 32">
      {children}
    </svg>
  );
}

function Stroke({ children }: { children: ReactNode }) {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
      {children}
    </g>
  );
}

export function CategoryIcon({ id, label, size = "md", className }: CategoryIconProps) {
  return (
    <span className={cn("category-icon grid place-items-center rounded-lg", sizes[size], className)}>
      <IconSvg label={label}>{renderIcon(id)}</IconSvg>
    </span>
  );
}

function renderIcon(id: string) {
  switch (id) {
    case "cleaning":
      return (
        <>
          <path d="M9 13h11l2 12H7l2-12Z" fill="#f05a5a" />
          <path d="M11 13V9a5 5 0 0 1 10 0v4" stroke="#edd185" strokeLinecap="round" strokeWidth="2.4" />
          <path d="M13 18h6M12 22h8" stroke="#ffffff" strokeLinecap="round" strokeWidth="2" />
          <circle cx="23.5" cy="8" fill="#edd185" r="2.5" />
          <circle cx="26" cy="13" fill="#edd185" opacity="0.75" r="1.5" />
        </>
      );
    case "repair":
      return (
        <Stroke>
          <path d="M21.5 5.5a6 6 0 0 0-7.2 7.7L5.7 21.8a3 3 0 0 0 4.2 4.2l8.6-8.6a6 6 0 0 0 7.9-7.4l-4.2 4.2-4-4 3.3-4.7Z" />
          <path d="M8 23.8l.1.1" />
        </Stroke>
      );
    case "massage":
      return (
        <>
          <path d="M8 20c2.5-5.6 5.8-8.4 10-8.4h2.4a4.8 4.8 0 0 1 4.8 4.8v.6" fill="none" stroke="#59d6e8" strokeLinecap="round" strokeWidth="2.8" />
          <path d="M6 24h13.5a6 6 0 0 0 6-6" fill="none" stroke="#6cf16d" strokeLinecap="round" strokeWidth="2.8" />
          <path d="M12 10.5c.8-3 2.5-4.8 5.2-5.4M18 9.8c1.8-1.8 3.8-2.8 6-3" fill="none" stroke="#edd185" strokeLinecap="round" strokeWidth="2.5" />
        </>
      );
    case "laundry":
      return (
        <Stroke>
          <rect height="22" rx="3" width="18" x="7" y="5" />
          <path d="M11 9h3" />
          <circle cx="16" cy="18" r="5.2" />
          <path d="M12.5 18c2.1-1.4 4.4-1.4 7 0" />
        </Stroke>
      );
    case "moving":
      return (
        <Stroke>
          <path d="M4 10h13v11H4z" />
          <path d="M17 14h5l5 5v2H17z" />
          <path d="M8 24a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM23 24a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M8 10V7h8" />
        </Stroke>
      );
    case "appliance":
      return (
        <Stroke>
          <rect height="12" rx="3" width="22" x="5" y="6" />
          <path d="M9 12h14" />
          <path d="M10 22c1.2-1 2.4-1 3.6 0M18.4 22c1.2-1 2.4-1 3.6 0" />
          <path d="M23 10h.1" />
        </Stroke>
      );
    case "install":
      return (
        <Stroke>
          <path d="M8 24 21.5 10.5" />
          <path d="m18.5 7.5 6 6" />
          <path d="M7 9h6M10 6v6" />
          <path d="m18 23 2.2 2.2L26 19.5" />
        </Stroke>
      );
    case "beauty":
      return (
        <Stroke>
          <path d="M12 5h8v5h-8z" />
          <path d="M14 10h4v5h-4z" />
          <path d="M12 15h8l2 10H10l2-10Z" />
          <path d="M15 20h2" />
          <path d="M6 11c2-1 3-2.5 3-5" />
        </Stroke>
      );
    case "nanny":
      return (
        <Stroke>
          <path d="M16 26c6-3.7 9-7.2 9-11.2A5 5 0 0 0 16 12a5 5 0 0 0-9 2.8C7 18.8 10 22.3 16 26Z" />
          <path d="M12 10c0-3 1.4-5 4-5s4 2 4 5" />
          <path d="M13 17h.1M19 17h.1M14 21c1.3.8 2.7.8 4 0" />
        </Stroke>
      );
    case "care":
      return (
        <Stroke>
          <path d="M5 20c3.8-.4 6.7.5 8.8 2.6L16 25l2.2-2.4C20.3 20.5 23.2 19.6 27 20" />
          <path d="M16 7v10M11 12h10" />
          <path d="M10 7h12v10H10z" />
        </Stroke>
      );
    case "deep":
      return (
        <Stroke>
          <path d="M10 13h13l-2 13h-9L10 13Z" />
          <path d="M12 13V9a4 4 0 0 1 8 0v4" />
          <path d="M6 23c2.5 1.7 5 1.7 7.5 0" />
          <path d="m23 6 2-2M25 10h3M23 14l2 2" />
        </Stroke>
      );
    case "glass":
      return (
        <Stroke>
          <rect height="20" rx="2.5" width="16" x="8" y="5" />
          <path d="M16 5v20M8 15h16" />
          <path d="M5 26c4-1.5 7.5-1.5 10.5 0" />
          <path d="m20 22 6 5" />
        </Stroke>
      );
    case "storage":
      return (
        <Stroke>
          <path d="M6 8h20v6H6zM8 14h16v6H8zM10 20h12v6H10z" />
          <path d="M14 11h4M14 17h4M14 23h4" />
        </Stroke>
      );
    case "homecare":
      return (
        <Stroke>
          <path d="m5 15 11-9 11 9" />
          <path d="M8 14v12h16V14" />
          <path d="M13 26v-7h6v7" />
          <path d="M22 9c2.5-.3 4-1.6 4.5-4" />
          <path d="M22 9c1.8 1 3.4 1 4.8 0" />
        </Stroke>
      );
    case "recycle":
      return (
        <>
          <path d="m15 5 4-2 2.5 5.2" fill="#edd185" />
          <path d="M19 8h5l3 5" fill="none" stroke="#6be562" strokeLinecap="round" strokeWidth="2.7" />
          <path d="M26 18.5 24.5 24H19" fill="none" stroke="#59d6e8" strokeLinecap="round" strokeWidth="2.7" />
          <path d="M13 25H7l2.6-5" fill="none" stroke="#f05a5a" strokeLinecap="round" strokeWidth="2.7" />
          <path d="M7.5 18 5 13l3.2-5" fill="none" stroke="#edd185" strokeLinecap="round" strokeWidth="2.7" />
        </>
      );
    case "pet":
      return (
        <>
          <path d="M10 15.5c0-4 2.7-7 6-7s6 3 6 7c0 5-3.2 9-6 9s-6-4-6-9Z" fill="#ff6a5f" />
          <path d="M8.4 12.2C6.5 10.8 5.8 8.5 7 7.3c1.3-1.3 3.4-.5 4.3 1.5" fill="#edd185" />
          <path d="M23.6 12.2c1.9-1.4 2.6-3.7 1.4-4.9-1.3-1.3-3.4-.5-4.3 1.5" fill="#edd185" />
          <path d="M13.2 16.5h.1M18.8 16.5h.1M16 18.7v2.1" stroke="#111" strokeLinecap="round" strokeWidth="2.2" />
        </>
      );
    case "business":
      return (
        <>
          <path d="M8 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" fill="none" stroke="#edd185" strokeWidth="2.5" />
          <path d="M5 11h22v15H5z" fill="#c59b45" />
          <path d="M5 16h22" stroke="#111" strokeWidth="2" />
          <path d="M13 16v3h6v-3" fill="#111" />
          <path d="M9 26v-4M23 26v-4" stroke="#111" strokeLinecap="round" strokeWidth="2" />
        </>
      );
    case "other":
      return (
        <Stroke>
          <path d="M7 8h7v7H7zM18 8h7v7h-7zM7 18h7v7H7z" />
          <path d="M21.5 18v7M18 21.5h7" />
        </Stroke>
      );
    case "dining":
      return (
        <Stroke>
          <path d="M8 5v10M12 5v10M10 15v12" />
          <path d="M22 5v22" />
          <path d="M18 5c0 4 1.2 7 4 9" />
          <path d="M6 23h20" />
        </Stroke>
      );
    default:
      return (
        <Stroke>
          <path d="M7 15.5 16 8l9 7.5" />
          <path d="M9 15v11h14V15" />
          <path d="M13 26v-7h6v7" />
        </Stroke>
      );
  }
}
