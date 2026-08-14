"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface MyTeam {
  id: string;
  teamName: string;
}

interface TeamContextType {
  myTeams: MyTeam[];
  loadingTeams: boolean;
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<number>(42);

  const { data: myTeams = [], isLoading: loadingTeams } = useQuery<MyTeam[]>({
    queryKey: ["teams", session?.user?.id],
    queryFn: async () => {
      const res = await fetch("/api/users/current/teams");
      if (!res.ok) throw new Error("Not signed in");
      return res.json();
    },
    enabled: !!session?.user,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (myTeams.length > 0 && !isInitialized) {
      setSelectedTeamId(myTeams[0].id);
      setIsInitialized(true);
    }
  }, [myTeams, isInitialized]);

  return (
    <TeamContext.Provider
      value={{
        myTeams,
        loadingTeams,
        selectedTeamId,
        setSelectedTeamId,
        activeWeek,
        setActiveWeek,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
