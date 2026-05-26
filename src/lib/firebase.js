import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import toast from 'react-hot-toast';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

export function handleFirestoreError(error, operationType, path = null) {
  const isOffline = error.message?.includes('Could not reach Cloud Firestore backend') || 
                    error.message?.includes('client is offline');

  if (isOffline || error.code === 'unavailable' || error.message?.includes('10 seconds')) {
    const offlineMsg = "Firestore is currently unreachable (Backend timeout). Please check your internet connection or try again later.";
    console.warn(offlineMsg);
    // You could also trigger a custom event or check window.navigator.onLine
  }

  if (error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || null,
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || true,
        providerInfo: user?.providerData || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
