import { useEffect, useState } from "react";
import { getAuthSession, subscribeAuthState } from "@/services/cliente/clienteService";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getAuthSession().then((sessionUser) => {
      setUser(sessionUser);
    });

    const unsubscribe = subscribeAuthState((authUser) => {
      setUser(authUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { user };
}