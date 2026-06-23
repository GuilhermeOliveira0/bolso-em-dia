import type { ReactNode } from "react";

type AppIconName =
  | "arrow-right"
  | "bell"
  | "car"
  | "chart"
  | "check"
  | "envelope"
  | "faders"
  | "hamburger"
  | "home"
  | "lightbulb"
  | "list"
  | "lock"
  | "martini"
  | "monitor"
  | "pill"
  | "plus"
  | "receipt"
  | "search"
  | "shopping-bag"
  | "shopping-cart"
  | "squares"
  | "user"
  | "wallet";

type AppIconProps = {
  name: AppIconName;
  className?: string;
  title?: string;
};

export function AppIcon({ name, className, title }: AppIconProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
    >
      {icons[name]}
    </svg>
  );
}

const icons: Record<AppIconName, ReactNode> = {
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  bell: (
    <>
      <path d="M7 10.5a5 5 0 0 1 10 0v3.7l1.3 2.1H5.7L7 14.2v-3.7Z" />
      <path d="M9.8 18.4a2.4 2.4 0 0 0 4.4 0" />
    </>
  ),
  car: (
    <>
      <path d="m5 13 1.4-4.2A2.6 2.6 0 0 1 8.9 7h6.2a2.6 2.6 0 0 1 2.5 1.8L19 13" />
      <path d="M4.5 13h15v5h-3v-1.7h-9V18h-3v-5Z" />
      <path d="M7.5 15.5h.1M16.4 15.5h.1" />
    </>
  ),
  chart: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12V3.5Z" />
      <path d="M14.5 3.9v5.6h5.6a7.2 7.2 0 0 0-5.6-5.6Z" />
    </>
  ),
  check: (
    <>
      <path d="M20 6 9 17l-5-5" />
    </>
  ),
  envelope: (
    <>
      <path d="M4.5 6.5h15v11h-15z" />
      <path d="m5 7 7 6 7-6" />
    </>
  ),
  faders: (
    <>
      <path d="M5 4v16M12 4v16M19 4v16" />
      <path d="M3.2 8.5h3.6M10.2 15.5h3.6M17.2 10.5h3.6" />
    </>
  ),
  hamburger: (
    <>
      <path d="M5 12.2h14a5.4 5.4 0 0 0-14 0Z" />
      <path d="M4 15h16M6 18h12" />
      <path d="M8 9.5h.1M12 8.8h.1M16 9.5h.1" />
    </>
  ),
  home: (
    <>
      <path d="m4 11 8-7 8 7" />
      <path d="M6.5 10v9h11v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M8.3 14.5a6 6 0 1 1 7.4 0c-.9.7-1.2 1.4-1.2 2.5h-5c0-1.1-.3-1.8-1.2-2.5Z" />
      <path d="M9.7 20h4.6M10 17h4" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.1M4 12h.1M4 18h.1" />
    </>
  ),
  lock: (
    <>
      <path d="M7 10V8a5 5 0 0 1 10 0v2" />
      <path d="M6 10h12v10H6z" />
      <path d="M12 14.5v2" />
    </>
  ),
  martini: (
    <>
      <path d="M5 4h14l-7 8-7-8Z" />
      <path d="M12 12v7M8.5 19h7" />
    </>
  ),
  monitor: (
    <>
      <path d="M4 5.5h16v10H4z" />
      <path d="m10 9 4 2-4 2V9ZM9 19h6M12 15.5V19" />
    </>
  ),
  pill: (
    <>
      <path d="M5.8 18.2a4 4 0 0 1 0-5.7l6.7-6.7a4 4 0 0 1 5.7 5.7l-6.7 6.7a4 4 0 0 1-5.7 0Z" />
      <path d="m9.2 9.2 5.6 5.6" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  receipt: (
    <>
      <path d="M7 4h10v16l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V4Z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  search: (
    <>
      <path d="M10.7 17.4a6.7 6.7 0 1 1 0-13.4 6.7 6.7 0 0 1 0 13.4Z" />
      <path d="m16 16 4 4" />
    </>
  ),
  "shopping-bag": (
    <>
      <path d="M6.5 8.5h11l-.8 11h-9.4l-.8-11Z" />
      <path d="M9 8.5a3 3 0 0 1 6 0" />
    </>
  ),
  "shopping-cart": (
    <>
      <path d="M4 5h2l1.4 9.2a2 2 0 0 0 2 1.7H17a2 2 0 0 0 1.9-1.4L20 9H7" />
      <path d="M9.5 20h.1M17 20h.1" />
    </>
  ),
  squares: (
    <>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </>
  ),
  user: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M15 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </>
  ),
};
