import { Outlet } from "react-router-dom";

/** Minimal layout: routes render their own header, tabs, and content (no app chrome). */
export function AppShell() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  );
}
