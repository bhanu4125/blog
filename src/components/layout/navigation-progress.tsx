"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationStarted = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startNavigation = useCallback(() => {
    navigationStarted.current = true;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setIsVisible(true);
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }

      startNavigation();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [startNavigation]);

  useEffect(() => {
    if (!navigationStarted.current) {
      return;
    }

    setIsNavigating(false);
    hideTimer.current = setTimeout(() => {
      navigationStarted.current = false;
      setIsVisible(false);
      hideTimer.current = null;
    }, 220);

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
  }, [pathname]);

  useEffect(
    () => () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    },
    []
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1, scaleX: 0.05 }}
          animate={
            isNavigating
              ? { opacity: 1, scaleX: 0.78 }
              : { opacity: 0, scaleX: 1 }
          }
          exit={{ opacity: 0 }}
          transition={
            isNavigating
              ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.18, ease: "easeOut" }
          }
          style={{ transformOrigin: "0% 50%" }}
          className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 bg-brand-600"
        />
      )}
    </AnimatePresence>
  );
}
