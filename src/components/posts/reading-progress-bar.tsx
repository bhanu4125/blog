"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: progress, transformOrigin: "0% 50%" }}
      className="pointer-events-none fixed left-0 right-0 top-16 z-40 h-1 bg-brand-600"
    />
  );
}
