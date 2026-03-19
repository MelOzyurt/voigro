import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminGuard() {
  const { data, isLoading, sessionReady, isFetching } = useAdminAuth();

  if (!sessionReady || isLoading || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data?.user || !data.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
