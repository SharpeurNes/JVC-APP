import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNavigationStore = create(
  persist(
    (set) => ({
      // État initial
      view: { name: 'home', data: null },
      
      // Action pour changer de vue
      setView: (newView) => set({ view: newView }),
    }),
    {
      name: 'last_view', // Le nom de la clé dans le localStorage
    }
  )
);