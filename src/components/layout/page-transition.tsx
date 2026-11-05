"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransitionVariants } from "@/lib/motion";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={pathname}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
