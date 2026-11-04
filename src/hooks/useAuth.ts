import { useEffect, useState } from "react";
import { getAuthSession, subscribeAuthState } from "@/services/cliente/clienteService";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const sessionUser = await getAuthSession();
        if (isMounted) {
          setUser(sessionUser);
        }
      } catch (err) {
        console.error("Error al obtener sesión en useAuth:", err);
      }
    };

    void fetchSession();

    const unsubscribe = subscribeAuthState((authUser) => {
      if (isMounted) {
        setUser(authUser);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user };
}
