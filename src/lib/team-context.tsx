"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<number>(42);

  useEffect(() => {
    fetch("/api/users/current/teams")
      .then((res) => {
        if (!res.ok) throw new Error("Not signed in");
        return res.json();
      })
      .then((teams: MyTeam[]) => {
        setMyTeams(teams);
        if (teams.length > 0) setSelectedTeamId(teams[0].id);
      })
      .catch(() => {
        setMyTeams([]);
        setSelectedTeamId(null);
      })
      .finally(() => setLoadingTeams(false));
  }, []);

  return (
    <TeamContext.Provider
      value={{ myTeams, loadingTeams, selectedTeamId, setSelectedTeamId, activeWeek, setActiveWeek }}
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
