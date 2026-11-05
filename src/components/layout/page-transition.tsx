"use client";

import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/lib/motion";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
