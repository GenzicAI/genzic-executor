import { cn } from "@/lib/utils";

interface LogoProps {
  /** Rendered pixel size (width & height). */
  size?: number;
  className?: string;
}

/**
 * The official Genzic.AI brand mark (public/logo.png). Centralized here so
 * every call site (top nav, Industry Selector) stays in sync.
 */
export function Logo({ size = 40, className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Genzic.AI"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
