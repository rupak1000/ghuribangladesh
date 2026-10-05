import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "amber";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-2 shadow-soft",
  secondary: "bg-card text-ink border border-line hover:border-forest/40 hover:bg-moss aria-pressed:border-emerald/40 aria-pressed:bg-emerald-soft aria-pressed:text-forest",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-white text-forest hover:bg-moss shadow-soft",
  amber: "bg-amber text-forest hover:brightness-95 shadow-soft",
};
const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm gap-1.5 md:h-9 md:px-3.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

interface Common { variant?: Variant; size?: Size; className?: string; children: ReactNode }

export function Button({ variant, size, className, ...rest }: Common & ComponentProps<"button">) {
  return <button type="button" className={buttonClass(variant, size, className)} {...rest} />;
}

export function LinkButton({ variant, size, className, ...rest }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}
