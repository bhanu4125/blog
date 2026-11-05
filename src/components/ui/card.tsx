"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type CardProps = HTMLMotionProps<"div">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`rounded-2xl border border-border bg-background shadow-sm ${className}`}
      {...props}
    />
  );
}
