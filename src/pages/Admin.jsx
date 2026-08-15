import { useLocation } from "react-router-dom";
import { AcceptInvite } from "../features/admin/AdminAuthViews";
import { AdminPortal } from "../features/admin/AdminPortal";

export default function Admin() {
  const location = useLocation();
  return location.pathname === "/admin/accept-invite" ? (
    <AcceptInvite />
  ) : (
    <AdminPortal />
  );
}
