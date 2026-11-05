"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import {
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary:
    "border border-border bg-background text-foreground hover:bg-slate-50 focus-visible:outline-brand-600 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-foreground hover:bg-slate-100 focus-visible:outline-brand-600 dark:hover:bg-slate-800",
};

export function Button({
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextRippleId = useRef(0);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!disabled) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const size = Math.hypot(bounds.width, bounds.height) * 2;
      const isKeyboardActivation = event.detail === 0;
      const x = isKeyboardActivation
        ? bounds.width / 2
        : event.clientX - bounds.left;
      const y = isKeyboardActivation
        ? bounds.height / 2
        : event.clientY - bounds.top;

      setRipples((current) => [
        ...current,
        { id: nextRippleId.current++, x, y, size },
      ]);
    }

    onClick?.(event);
  };

  function removeRipple(id: number) {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={handleClick}
      className={`relative isolate inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <AnimatePresence initial={false}>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            aria-hidden="true"
            initial={{ opacity: 0.25, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              marginLeft: -ripple.size / 2,
              marginTop: -ripple.size / 2,
            }}
            className="pointer-events-none absolute rounded-full bg-current"
          />
        ))}
      </AnimatePresence>
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
