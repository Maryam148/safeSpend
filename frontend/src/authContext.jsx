import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)
  useEffect(() => {

    const getInitializedSession = async () => {
      const {data :{session}} = await supabase.auth.getSession()
      setUser(session?.user ?? null);
      setLoading(false)
    }
    getInitializedSession();

    const {data: { subscription },} = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false)
    });

    return () => subscription.unsubscribe()}, []);


  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
