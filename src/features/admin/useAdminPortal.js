import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { fetchAdminContent, fetchAdminMembership } from "../../services/contentService";

export function useAdminPortal() {
  const [session, setSession] = useState(undefined);
  const [membership, setMembership] = useState(undefined);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const { data: { session: nextSession } } = await supabase.auth.getSession();
    setSession(nextSession);
    if (!nextSession) {
      setMembership(undefined);
      setData(null);
      return;
    }
    const member = await fetchAdminMembership(nextSession.user.id);
    if (!member?.active) {
      setMembership(null);
      setData(null);
      return;
    }
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance?.currentLevel !== "aal2") {
      setMembership({ ...member, mfa: false });
      setData(null);
      return;
    }
    setMembership(member);
    setData(await fetchAdminContent());
  }, []);

  useEffect(() => {
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() =>
      setTimeout(load, 0),
    );
    return () => subscription.unsubscribe();
  }, [load]);

  const refreshData = useCallback(async () => {
    setData(await fetchAdminContent());
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMembership(undefined);
    setData(null);
  }, []);

  return { session, membership, data, load, refreshData, signOut };
}
