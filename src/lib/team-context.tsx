"use client";

import React, { createContext, useContext, useState } from "react";
import { TEAMS } from "./mock-data";

interface TeamContextType {
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(TEAMS[0].id);
  const [activeWeek, setActiveWeek] = useState<number>(42);

  return (
    <TeamContext.Provider value={{ selectedTeamId, setSelectedTeamId, activeWeek, setActiveWeek }}>
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
