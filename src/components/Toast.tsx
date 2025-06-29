"use client";

import { useEffect } from "react";
import { useToastStore } from "../lib/store";
import { AnimatePresence, motion } from "framer-motion";

export function Toast() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), toast.duration || 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`bg-pink-600 text-white px-4 py-3 rounded-2xl shadow-lg max-w-xs`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
