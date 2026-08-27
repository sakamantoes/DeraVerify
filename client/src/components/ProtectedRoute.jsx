import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../service/auth.js";
import useAuth from "../store/useAuth.js";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ role, children }) {
  const { user, status, setStatus, setAuthUser, clearAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      setStatus("checking");
      setIsChecking(true);

      try {
        const res = await getAuthUser();

        if (res.status === 200 || res.status === 201) {
          setAuthUser(res.data);
          return;
        }

        clearAuth();
      } catch (error) {
        console.error("fetching user data: ", error);
        clearAuth();
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuthUser, setStatus]);

  if (isChecking || status === "checking") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-spin" /> <p>Getting you set up...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  const authUser = user?.data || user;

  if (role && authUser?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
