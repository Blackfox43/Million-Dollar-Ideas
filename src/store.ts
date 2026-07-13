import { create } from 'zustand';
import { db, type Idea } from './db';
import { db as fdb } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Filters {
  niche: string;
  budget: string;
  time_to_launch: string;
  difficulty: string;
}

interface AppState {
  // Onboarding
  isOnboarded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Subscription/Stripe MVP
  isPremiumUser: boolean;
  showPaywallModal: boolean;
  setPaywallModal: (show: boolean) => void;
  subscribeToPremium: () => void;
  cancelSubscription: () => void;

  // Navigation
  activeTab: 'generate' | 'favorites' | 'stats' | 'profile';
  setActiveTab: (tab: 'generate' | 'favorites' | 'stats' | 'profile') => void;

  // Filters
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;

  // Core Idea Generation
  currentIdea: Idea | null;
  setCurrentIdea: (idea: Idea | null) => void;
  generateIdea: () => Promise<{ success: boolean; message?: string }>;

  // Favorites
  favorites: string[]; // List of idea IDs
  loadFavorites: () => Promise<void>;
  toggleFavorite: (ideaId: string) => Promise<void>;

  // Offline stats
  stats: {
    totalLoaded: number;
    favoritesCount: number;
    premiumCount: number;
  };
  updateStats: () => Promise<void>;

  // Progression (Daily Streak, XP, Achievements)
  streak: number;
  xp: number;
  badges: string[]; // e.g., ['pioneer', 'vault_keeper', 'streak_starter', 'hustle_legend', 'xp_master', 'unicorn_hunter']
  lastActiveDate: string; // YYYY-MM-DD
  checkedInToday: boolean;
  checkIn: () => { gainedXp: number; streakUpdated: boolean };
  awardXp: (amount: number, reason?: string) => { unlockedBadge: string | null };
  unlockBadge: (badgeId: string) => boolean;

  // Crazy Ideas Mode (Day 7 Unlock)
  crazyModeEnabled: boolean;
  setCrazyModeEnabled: (enabled: boolean) => void;

  // Firebase Authentication & Database Cloud Synchronization
  user: any | null; // Firebase User details
  userLoading: boolean;
  setUser: (user: any | null) => Promise<void>;
  syncWithCloud: () => Promise<void>;
  uploadLocalStateToCloud: () => Promise<void>;
  downloadCloudStateToLocal: (cloudData: any) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Firebase Auth & Cloud Sync State
  user: null,
  userLoading: true,
  setUser: async (user) => {
    set({ user, userLoading: false });
    if (user) {
      await get().syncWithCloud();
    }
  },

  syncWithCloud: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const userRef = doc(fdb, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await get().downloadCloudStateToLocal(docSnap.data());
      } else {
        await get().uploadLocalStateToCloud();
      }
    } catch (err) {
      console.error("Cloud synchronization error:", err);
    }
  },

  uploadLocalStateToCloud: async () => {
    const user = get().user;
    if (!user) return;
    try {
      const userRef = doc(fdb, 'users', user.uid);
      const state = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Creator',
        photoURL: user.photoURL || '',
        streak: get().streak,
        xp: get().xp,
        badges: get().badges,
        lastActiveDate: get().lastActiveDate,
        isPremiumUser: get().isPremiumUser,
        favorites: get().favorites,
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, state, { merge: true });
    } catch (err) {
      console.error("Error uploading local state to cloud:", err);
    }
  },

  downloadCloudStateToLocal: async (cloudData) => {
    if (!cloudData) return;
    
    localStorage.setItem('m_ideas_streak', (cloudData.streak ?? 0).toString());
    localStorage.setItem('m_ideas_xp', (cloudData.xp ?? 0).toString());
    localStorage.setItem('m_ideas_badges', JSON.stringify(cloudData.badges ?? []));
    localStorage.setItem('m_ideas_last_active', cloudData.lastActiveDate ?? '');
    localStorage.setItem('m_ideas_premium', (cloudData.isPremiumUser ?? false) ? 'true' : 'false');
    
    const cloudFavs = cloudData.favorites ?? [];
    await db.favorites.clear();
    for (const ideaId of cloudFavs) {
      await db.favorites.add({ ideaId, savedAt: Date.now() });
    }
    
    set({
      streak: cloudData.streak ?? 0,
      xp: cloudData.xp ?? 0,
      badges: cloudData.badges ?? [],
      lastActiveDate: cloudData.lastActiveDate ?? '',
      isPremiumUser: cloudData.isPremiumUser ?? false,
      favorites: cloudFavs,
      checkedInToday: cloudData.lastActiveDate === new Date().toISOString().split('T')[0]
    });
    
    await get().updateStats();
  },

  // Progression Initial State
  crazyModeEnabled: localStorage.getItem('m_ideas_crazy_mode') === 'true',
  setCrazyModeEnabled: (enabled: boolean) => {
    localStorage.setItem('m_ideas_crazy_mode', enabled.toString());
    set({ crazyModeEnabled: enabled });
  },
  streak: (() => {
    const val = localStorage.getItem('m_ideas_streak');
    return val ? parseInt(val, 10) : 0;
  })(),
  xp: (() => {
    const val = localStorage.getItem('m_ideas_xp');
    return val ? parseInt(val, 10) : 0;
  })(),
  badges: (() => {
    try {
      return JSON.parse(localStorage.getItem('m_ideas_badges') || '[]');
    } catch {
      return [];
    }
  })(),
  lastActiveDate: localStorage.getItem('m_ideas_last_active') || '',
  checkedInToday: localStorage.getItem('m_ideas_last_active') === new Date().toISOString().split('T')[0],

  checkIn: () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = get().lastActiveDate;
    let currentStreak = get().streak;
    let currentXp = get().xp;
    let streakUpdated = false;
    let gainedXp = 0;

    if (lastActive === todayStr) {
      return { gainedXp: 0, streakUpdated: false };
    }

    // Calculate if consecutive
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      currentStreak += 1;
      streakUpdated = true;
    } else {
      currentStreak = 1;
      streakUpdated = true;
    }

    gainedXp = 50 + currentStreak * 20;
    currentXp += gainedXp;

    localStorage.setItem('m_ideas_last_active', todayStr);
    localStorage.setItem('m_ideas_streak', currentStreak.toString());
    localStorage.setItem('m_ideas_xp', currentXp.toString());

    set({
      streak: currentStreak,
      xp: currentXp,
      lastActiveDate: todayStr,
      checkedInToday: true,
    });

    // Check for streak milestones
    if (currentStreak >= 2) {
      get().unlockBadge('streak_starter');
    }
    if (currentStreak >= 5) {
      get().unlockBadge('hustle_legend');
    }

    // Automatically sync progress with Firebase Cloud Firestore
    get().uploadLocalStateToCloud();

    return { gainedXp, streakUpdated };
  },

  awardXp: (amount, reason) => {
    const newXp = get().xp + amount;
    localStorage.setItem('m_ideas_xp', newXp.toString());
    set({ xp: newXp });

    let unlockedBadge: string | null = null;
    if (newXp >= 1000) {
      const didUnlock = get().unlockBadge('xp_master');
      if (didUnlock) unlockedBadge = 'xp_master';
    }

    // Automatically sync progress with Firebase Cloud Firestore
    get().uploadLocalStateToCloud();

    return { unlockedBadge };
  },

  unlockBadge: (badgeId) => {
    const currentBadges = [...get().badges];
    if (currentBadges.includes(badgeId)) return false;

    currentBadges.push(badgeId);
    localStorage.setItem('m_ideas_badges', JSON.stringify(currentBadges));
    set({ badges: currentBadges });

    // Award bonus XP for badge unlocks
    const bonusXp = badgeId === 'pioneer' ? 100 
                  : badgeId === 'vault_keeper' ? 200 
                  : badgeId === 'streak_starter' ? 300 
                  : badgeId === 'hustle_legend' ? 500 
                  : badgeId === 'xp_master' ? 500 
                  : badgeId === 'unicorn_hunter' ? 400 : 100;
    
    get().awardXp(bonusXp, `Unlocked Badge: ${badgeId}`);
    
    // Automatically sync progress with Firebase Cloud Firestore
    get().uploadLocalStateToCloud();
    return true;
  },

  // Onboarding
  isOnboarded: localStorage.getItem('m_ideas_onboarded') === 'true',
  completeOnboarding: () => {
    localStorage.setItem('m_ideas_onboarded', 'true');
    set({ isOnboarded: true });
  },
  resetOnboarding: () => {
    localStorage.removeItem('m_ideas_onboarded');
    set({ isOnboarded: false });
  },

  // Subscription / Stripe Simulator
  isPremiumUser: localStorage.getItem('m_ideas_premium') === 'true',
  showPaywallModal: false,
  setPaywallModal: (show) => set({ showPaywallModal: show }),
  subscribeToPremium: () => {
    localStorage.setItem('m_ideas_premium', 'true');
    set({ isPremiumUser: true, showPaywallModal: false });
    get().updateStats();
    get().uploadLocalStateToCloud();
  },
  cancelSubscription: () => {
    localStorage.removeItem('m_ideas_premium');
    set({ isPremiumUser: false });
    get().updateStats();
    get().uploadLocalStateToCloud();
  },

  // Navigation
  activeTab: 'generate',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Filters
  filters: {
    niche: 'All',
    budget: 'All',
    time_to_launch: 'All',
    difficulty: 'All',
  },
  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },
  resetFilters: () => {
    set({
      filters: {
        niche: 'All',
        budget: 'All',
        time_to_launch: 'All',
        difficulty: 'All',
      },
    });
  },

  // Current generated idea
  currentIdea: null,
  setCurrentIdea: (idea) => set({ currentIdea: idea }),

  generateIdea: async () => {
    const { filters, isPremiumUser, crazyModeEnabled } = get();

    // Query IndexedDB for matching ideas
    let query: any = db.ideas;

    // Fetch all ideas first since Dexie doesn't support complex multi-index intersections out-of-the-box easily
    let matchingIdeas = await query.toArray();

    // Filter programmatically for 100% accuracy and safety
    matchingIdeas = matchingIdeas.filter((idea: Idea) => {
      if (crazyModeEnabled) {
        return idea.niche === 'Crazy Ideas';
      }
      if (filters.niche !== 'All' && idea.niche !== filters.niche) return false;
      if (filters.budget !== 'All' && idea.budget !== filters.budget) return false;
      if (filters.time_to_launch !== 'All' && idea.time_to_launch !== filters.time_to_launch) return false;
      if (filters.difficulty !== 'All' && idea.difficulty !== filters.difficulty) return false;
      return true;
    });

    if (matchingIdeas.length === 0) {
      return {
        success: false,
        message: 'No ideas match these exact filters. Try relaxing some options!',
      };
    }

    // Select a random idea
    const randomIndex = Math.floor(Math.random() * matchingIdeas.length);
    const chosenIdea = matchingIdeas[randomIndex];

    // Check if it's premium and the user is NOT premium
    if (chosenIdea.isPremium && !isPremiumUser) {
      // Trigger Stripe paywall modal
      set({ showPaywallModal: true });
      return {
        success: false,
        message: 'PAYWALL',
      };
    }

    set({ currentIdea: chosenIdea });
    get().awardXp(50, 'Generated a side-hustle idea');
    get().unlockBadge('pioneer');
    return { success: true };
  },

  // Favorites Management
  favorites: [],
  loadFavorites: async () => {
    const favs = await db.favorites.toArray();
    set({ favorites: favs.map((f) => f.ideaId) });
    await get().updateStats();
  },

  toggleFavorite: async (ideaId) => {
    const existing = await db.favorites.where('ideaId').equals(ideaId).first();
    if (existing) {
      if (existing.id !== undefined) {
        await db.favorites.delete(existing.id);
      }
    } else {
      await db.favorites.add({
        ideaId,
        savedAt: Date.now(),
      });
      get().awardXp(150, 'Favorited a startup blueprint');
    }
    await get().loadFavorites();
    const favCount = get().favorites.length;
    if (favCount >= 3) {
      get().unlockBadge('vault_keeper');
    }
    get().uploadLocalStateToCloud();
  },

  // Stats for the stats screen / dashboard helper
  stats: {
    totalLoaded: 0,
    favoritesCount: 0,
    premiumCount: 0,
  },
  updateStats: async () => {
    const total = await db.ideas.count();
    const favs = await db.favorites.count();
    const premium = await db.ideas.where('isPremium').equals(1).count(); // Dexie boolean works with 1 or true

    set({
      stats: {
        totalLoaded: total,
        favoritesCount: favs,
        premiumCount: premium,
      },
    });
  },
}));
