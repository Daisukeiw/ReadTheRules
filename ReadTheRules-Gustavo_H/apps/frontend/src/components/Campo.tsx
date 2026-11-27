import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CampoProps = React.ComponentProps<"input"> & { label: string };

// Rótulo + campo no visual do Read the Rules (borda vermelha, foco dourado).
export function Campo({ label, className, ...props }: CampoProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-display text-sm tracking-wide text-pergaminho">{label}</Label>
      <Input
        id={id}
        className={cn(
          "h-11 border-sangue/70 bg-input px-3.5 font-serif text-lg text-texto placeholder:text-muted-foreground/70 md:text-lg",
          "focus-visible:border-ouro focus-visible:ring-ouro/25",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function BotaoOuro({ className, variant, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      className={cn(
        "h-11 rounded-full px-7 font-display text-base font-semibold tracking-wide",
        "transition-[transform,background-color,box-shadow] duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
        variant === "outline"
          ? "border-pergaminho/50 bg-transparent text-pergaminho hover:border-ouro hover:bg-ouro/10 hover:text-ouro dark:bg-transparent"
          : "bg-ouro text-noite shadow-[0_8px_24px_-10px_rgba(189,155,96,.7)] hover:bg-[#cdae77]",
        className,
      )}
      {...props}
    />
  );
}
