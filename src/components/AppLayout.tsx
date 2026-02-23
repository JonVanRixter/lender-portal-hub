import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
