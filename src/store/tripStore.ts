import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, EmergencyContact, BudgetItem, JournalEntry } from '@/types/trip';

interface TripState {
  trips: Trip[];
  emergencyContacts: EmergencyContact[];
  budgetItems: BudgetItem[];
  journalEntries: JournalEntry[];
  currentTripId: string | null;
  userName: string;
  
  // Trip actions
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setCurrentTrip: (id: string | null) => void;
  
  // Emergency contacts
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (id: string) => void;
  
  // Budget
  addBudgetItem: (item: BudgetItem) => void;
  removeBudgetItem: (id: string) => void;
  
  // Journal
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  
  // User
  setUserName: (name: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      emergencyContacts: [],
      budgetItems: [],
      journalEntries: [],
      currentTripId: null,
      userName: 'Traveler',
      
      addTrip: (trip) =>
        set((state) => ({ trips: [...state.trips, trip] })),
      
      updateTrip: (id, updates) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === id ? { ...trip, ...updates, updatedAt: new Date().toISOString() } : trip
          ),
        })),
      
      deleteTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== id),
          budgetItems: state.budgetItems.filter((item) => item.tripId !== id),
          journalEntries: state.journalEntries.filter((entry) => entry.tripId !== id),
        })),
      
      setCurrentTrip: (id) => set({ currentTripId: id }),
      
      addEmergencyContact: (contact) =>
        set((state) => ({ emergencyContacts: [...state.emergencyContacts, contact] })),
      
      removeEmergencyContact: (id) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        })),
      
      addBudgetItem: (item) =>
        set((state) => ({ budgetItems: [...state.budgetItems, item] })),
      
      removeBudgetItem: (id) =>
        set((state) => ({
          budgetItems: state.budgetItems.filter((item) => item.id !== id),
        })),
      
      addJournalEntry: (entry) =>
        set((state) => ({ journalEntries: [...state.journalEntries, entry] })),
      
      updateJournalEntry: (id, updates) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),
      
      setUserName: (name) => set({ userName: name }),
    }),
    {
      name: 'enviroai-storage',
    }
  )
);
