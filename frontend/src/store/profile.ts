import { create } from 'zustand';

export type CivicProfile = {
  id: string;
  displayName: string;
  municipality: string;
  interests: string[];
};

type ProfileState = {
  profile: CivicProfile;
  setProfile: (profile: CivicProfile) => void;
};

const defaultProfile: CivicProfile = {
  id: 'demo-user',
  displayName: 'Ciudadana Demo',
  municipality: 'CDMX',
  interests: ['salud', 'educación'],
};

export const useProfileStore = create<ProfileState>(set => ({
  profile: defaultProfile,
  setProfile: profile => set({ profile }),
}));
