type BrandLogoProps = {
  className?: string;
  title?: string;
};

export function BrandLogo({ className, title = "Bolso em Dia" }: BrandLogoProps) {
  const titleId = "brand-logo-title";

  return (
    <svg
      aria-labelledby={titleId}
      className={className}
      fill="none"
      focusable="false"
      role="img"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={titleId}>{title}</title>
      <defs>
        <linearGradient id="brandBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="brandPink" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect fill="url(#brandBlue)" height="80" rx="15" width="30" x="25" y="20" />
      <rect
        fill="url(#brandPink)"
        height="45"
        opacity="0.85"
        rx="22.5"
        width="55"
        x="25"
        y="20"
      />
      <rect
        fill="url(#brandBlue)"
        height="50"
        opacity="0.95"
        rx="25"
        width="70"
        x="25"
        y="50"
      />
      <circle cx="85" cy="25" fill="#10B981" r="8" />
    </svg>
  );
}
