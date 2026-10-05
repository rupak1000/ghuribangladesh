/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="Ghuri Bangladesh home">
      <img src="/logo.png" alt="Ghuri Bangladesh" width={1200} height={270} className={className ?? "h-7 w-auto min-[400px]:h-9 sm:h-10 lg:h-12"} />
    </Link>
  );
}
