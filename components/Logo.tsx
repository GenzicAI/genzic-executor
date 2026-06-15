import { cn } from "@/lib/utils";

interface LogoProps {
  /** Rendered pixel size (width & height). */
  size?: number;
  className?: string;
}

/**
 * The Genzic.AI brand mark. Served from /logo.svg so it can be swapped for an
 * exact brand asset (e.g. public/logo.png) without touching call sites.
 */
export function Logo({ size = 40, className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Genzic.AI"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
