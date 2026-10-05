"use client";

import { Printer } from "lucide-react";
import { Button } from "../ui/Button";
import { T } from "@/components/T";

export function PrintButton({ className }: { className?: string }) {
  return (
    <Button variant="secondary" className={className} onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden /> <T>Print / Save as PDF</T>
    </Button>
  );
}
