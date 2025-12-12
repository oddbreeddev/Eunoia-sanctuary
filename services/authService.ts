import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  User,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isMockMode } from "./firebaseConfig";

export interface UserData {
  email: string;
  password?: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Partial<User> & { uid: string; email: string; displayName: string | null };
}

const getErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try logging in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password or email.';
    default:
      return error.message || 'An authentication error occurred.';
  }
};

// --- MOCK DATABASE HELPERS (Legacy/Fallback) ---
const getMockAuthDB = (): any[] => {
    try {
        return JSON.parse(localStorage.getItem('eunoia_mock_auth_db') || '[]');
    } catch { return []; }
};

const saveMockAuthDB = (users: any[]) => {
    localStorage.setItem('eunoia_mock_auth_db', JSON.stringify(users));
};

const createMockUserProfile = (user: any) => {
    try {
        const users = JSON.parse(localStorage.getItem('eunoia_users_db') || '[]');
        const exists = users.find((u: any) => u.id === user.uid);
        if (!exists) {
            users.push({
                id: user.uid,
                name: user.displayName || 'Traveler',
                email: user.email,
                joinedDate: new Date().toLocaleDateString(),
                status: 'Active'
            });
            localStorage.setItem('eunoia_users_db', JSON.stringify(users));
        }
    } catch (e) { console.error("Failed to create mock profile", e); }
};

export const loginUser = async (data: UserData): Promise<AuthResponse> => {
  if (!data.password) {
    return { success: false, message: "Password is required" };
  }

  // --- MOCK MODE LOGIC ---
  if (isMockMode || !auth) {
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    const dbLocal = getMockAuthDB();
    const user = dbLocal.find((u: any) => u.email.toLowerCase() === data.email.toLowerCase());

    if (!user) {
        return { success: false, message: "No account found. Please sign up first (Demo Mode)." };
    }

    if (user.password !== data.password) {
        return { success: false, message: "Incorrect password (Demo Mode)." };
    }

    return {
      success: true,
      message: "Welcome back to the Sanctuary.",
      user: { 
          uid: user.uid, 
          email: user.email, 
          displayName: user.displayName,
          emailVerified: true,
          isAnonymous: false,
          metadata: {}, 
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'mock'
      } as any
    };
  }
  // -----------------------

  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    
    // --- DATABASE INTEGRITY CHECK (SELF-HEALING) ---
    // This ensures that if a user exists in Auth but not in Firestore (e.g., previous write failed),
    // we recreate the database entry so they don't get a blank screen.
    if (db && userCredential.user) {
        try {
            const userRef = doc(db, "users", userCredential.user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                console.log("Restoring missing user profile...");
                await setDoc(userRef, {
                    id: userCredential.user.uid,
                    name: userCredential.user.displayName || 'Traveler',
                    email: userCredential.user.email,
                    joinedDate: new Date().toLocaleDateString(),
                    status: 'Active'
                }, { merge: true });
            }
        } catch (dbError) {
            console.error("Database consistency check failed:", dbError);
            // We don't block login here, but data might be missing
        }
    }

    return {
      success: true,
      message: "Welcome back to the Sanctuary.",
      user: userCredential.user as any
    };
  } catch (error: any) {
    if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(error.code)) {
       console.warn("Login Validation:", error.code);
    } else {
       console.error("Login Error:", error);
    }

    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const registerUser = async (data: UserData): Promise<AuthResponse> => {
  if (!data.password) {
    return { success: false, message: "Password is required" };
  }

  // --- MOCK MODE LOGIC ---
  if (isMockMode || !auth) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dbMock = getMockAuthDB();
    const existing = dbMock.find((u: any) => u.email.toLowerCase() === data.email.toLowerCase());

    if (existing) {
        return { success: false, message: "That email is already registered (Demo Mode)." };
    }

    const newUser = {
        uid: 'mock-' + Date.now(),
        email: data.email,
        password: data.password, 
        displayName: data.name || "Traveler"
    };

    dbMock.push(newUser);
    saveMockAuthDB(dbMock);
    createMockUserProfile(newUser); 

    return {
      success: true,
      message: "Account created successfully.",
      user: { 
          uid: newUser.uid, 
          email: newUser.email, 
          displayName: newUser.displayName,
          emailVerified: true,
          isAnonymous: false,
          metadata: {}, 
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'mock'
      } as any
    };
  }
  // -----------------------

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    if (data.name && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: data.name
      });
    }

    // --- CREATE PERMANENT FIRESTORE PROFILE ---
    // This is the critical step for persistence.
    if (db) {
        try {
            await setDoc(doc(db, "users", userCredential.user.uid), {
                id: userCredential.user.uid,
                name: data.name || 'Traveler',
                email: data.email,
                joinedDate: new Date().toLocaleDateString(),
                status: 'Active'
            });
        } catch (e) {
            console.error("CRITICAL: Error creating database profile:", e);
            // Even if this fails, the 'loginUser' function's self-healing will catch it next time.
        }
    }

    return {
      success: true,
      message: "Account created successfully. Your journey begins.",
      user: userCredential.user as any
    };
  } catch (error: any) {
    if (['auth/email-already-in-use', 'auth/weak-password', 'auth/invalid-email'].includes(error.code)) {
        console.warn("Registration Validation:", error.code);
    } else {
        console.error("Registration Error:", error);
    }

    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};