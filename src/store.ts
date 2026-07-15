import { create } from 'zustand';
import { User } from 'firebase/auth';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface AppState {
  user: User | null;
  isSubscribed: boolean;
  stripeCustomerId: string | null;
  setUser: (user: User | null) => void;
  setSubscription: (isSubscribed: boolean, customerId?: string | null) => void;
}

export const useStore = create<AppState>((set) => {
  let unsubscribeDocListener: (() => void) | null = null;

  return {
    user: null,
    isSubscribed: false,
    stripeCustomerId: null,

    setUser: (user) => {
      set({ user });

      // Clean up past subscriptions listener if user logs out
      if (unsubscribeDocListener) {
        unsubscribeDocListener();
        unsubscribeDocListener = null;
      }

      // If user exists, attach live database subscription state observer
      if (user) {
        unsubscribeDocListener = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            set({ 
              isSubscribed: data.isPremium === true,
              stripeCustomerId: data.stripeCustomerId || null
            });
          } else {
            set({ isSubscribed: false, stripeCustomerId: null });
          }
        });
      } else {
        set({ isSubscribed: false, stripeCustomerId: null });
      }
    },

    setSubscription: (isSubscribed, stripeCustomerId = null) => {
      set({ isSubscribed, stripeCustomerId });
    },
  };
});
