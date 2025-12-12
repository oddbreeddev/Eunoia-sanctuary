import { GoogleGenAI } from "@google/genai";
import { 
  collection, getDocs, doc, deleteDoc, updateDoc, 
  addDoc, setDoc, getDoc, query, where, orderBy 
} from "firebase/firestore";
import { db, isMockMode } from "./firebaseConfig";

// --- TYPES ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  status: 'Active' | 'Banned';
  // Quiz Results
  archetype?: any;
  temperament?: any;
  ikigai?: any;
  synthesis?: any;
  nickname?: string;
  bio?: string; // Added bio
  pronouns?: string; // Added pronouns
  location?: string; // Added location
}

export interface Mentor {
  id: string;
  name: string;
  specialization: string;
  imageUrl: string;
  bio?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  archetypeDistribution: Record<string, number>;
  temperamentDistribution: Record<string, number>;
}

// --- PERSISTENCE HELPERS (Fallback) ---
const loadLocal = <T>(key: string, def: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : def;
  } catch (e) { return def; }
};
const saveLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// --- ADMIN AUTH ---
export const adminAuth = {
  login: (email: string, pass: string) => {
    return email === "admin@eunoia" && pass === "08022857727";
  }
};

// ==========================================
// FIRESTORE / DATA OPERATIONS
// ==========================================

// --- USERS ---

const getMockUsersDB = (): UserProfile[] => loadLocal('eunoia_users_db', []);
const saveMockUsersDB = (users: UserProfile[]) => saveLocal('eunoia_users_db', users);

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  if (!db || isMockMode) return getMockUsersDB();

  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    console.error("Error fetching users from DB:", error);
    return []; 
  }
};

export const getUserProfile = async (id: string): Promise<UserProfile | null> => {
  if (!db || isMockMode) {
    const users = getMockUsersDB();
    const user = users.find(u => u.id === id);
    return user || null;
  }

  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (id: string, data: Partial<UserProfile>): Promise<boolean> => {
    if (!db || isMockMode) {
        const users = getMockUsersDB();
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) {
            users[idx] = { ...users[idx], ...data };
            saveMockUsersDB(users);
            return true;
        }
        return false;
    }

    try {
        const docRef = doc(db, "users", id);
        await setDoc(docRef, data, { merge: true });
        return true;
    } catch (e) {
        console.error("Error updating profile", e);
        return false;
    }
}

export const deleteUserOp = async (id: string): Promise<boolean> => {
  if (!db || isMockMode) {
    let users = getMockUsersDB();
    users = users.filter(u => u.id !== id);
    saveMockUsersDB(users);
    return true;
  }

  try {
    await deleteDoc(doc(db, "users", id));
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

export const toggleUserStatusOp = async (id: string, currentStatus: string): Promise<boolean> => {
  const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
  
  if (!db || isMockMode) {
    const users = getMockUsersDB();
    const u = users.find(u => u.id === id);
    if (u) {
      u.status = newStatus;
      saveMockUsersDB(users);
    }
    return true;
  }

  try {
    await updateDoc(doc(db, "users", id), { status: newStatus });
    return true;
  } catch (error) {
    console.error("Error updating status:", error);
    return false;
  }
};

export const saveUserProgress = async (userId: string, data: Partial<UserProfile>) => {
  if (!userId) return;

  if (!db || isMockMode) {
     const users = getMockUsersDB();
     const existingIndex = users.findIndex(u => u.id === userId);
     if (existingIndex >= 0) {
         users[existingIndex] = { ...users[existingIndex], ...data };
     } else {
         users.push({ 
             id: userId, 
             name: data.name || 'User', 
             email: data.email || 'user@example.com',
             joinedDate: new Date().toLocaleDateString(), 
             status: 'Active',
             ...data 
         } as UserProfile);
     }
     saveMockUsersDB(users);
     return;
  }

  try {
    await setDoc(doc(db, "users", userId), data, { merge: true });
  } catch (error) {
    console.error("Error saving user progress:", error);
    throw error;
  }
};

// --- MENTORS ---

const getMockMentorsDB = (): Mentor[] => loadLocal('eunoia_mentors_db', []);
const saveMockMentorsDB = (mentors: Mentor[]) => saveLocal('eunoia_mentors_db', mentors);

export const fetchMentors = async (): Promise<Mentor[]> => {
  if (!db || isMockMode) return getMockMentorsDB();

  try {
    const querySnapshot = await getDocs(collection(db, "mentors"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }
};

export const addMentorOp = async (mentor: Omit<Mentor, 'id'>): Promise<Mentor | null> => {
  if (!db || isMockMode) {
    const mentors = getMockMentorsDB();
    const newMentor = { ...mentor, id: Date.now().toString() };
    mentors.push(newMentor);
    saveMockMentorsDB(mentors);
    return newMentor;
  }

  try {
    const docRef = await addDoc(collection(db, "mentors"), mentor);
    return { ...mentor, id: docRef.id };
  } catch (error) {
    console.error("Error adding mentor:", error);
    return null;
  }
};

export const deleteMentorOp = async (id: string): Promise<boolean> => {
  if (!db || isMockMode) {
    let mentors = getMockMentorsDB();
    mentors = mentors.filter(m => m.id !== id);
    saveMockMentorsDB(mentors);
    return true;
  }

  try {
    await deleteDoc(doc(db, "mentors", id));
    return true;
  } catch (error) {
    console.error("Error deleting mentor:", error);
    return false;
  }
};

// --- MESSAGES ---

const getMockMessagesDB = (): ContactMessage[] => loadLocal('eunoia_messages_db', []);
const saveMockMessagesDB = (msgs: ContactMessage[]) => saveLocal('eunoia_messages_db', msgs);

export const submitContactMessage = async (data: { name: string; email: string; message: string }) => {
  const newMessage: ContactMessage = {
    id: Date.now().toString(), // Temp ID, overwritten by Firestore ID if active
    ...data,
    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
    read: false
  };

  if (!db || isMockMode) {
    const msgs = getMockMessagesDB();
    msgs.unshift(newMessage);
    saveMockMessagesDB(msgs);
    return true;
  }

  try {
    await addDoc(collection(db, "messages"), newMessage);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

export const fetchMessages = async (): Promise<ContactMessage[]> => {
  if (!db || isMockMode) return getMockMessagesDB();

  try {
    const q = query(collection(db, "messages"), orderBy("date", "desc"));
    let querySnapshot;
    try {
        querySnapshot = await getDocs(q);
    } catch {
        querySnapshot = await getDocs(collection(db, "messages"));
    }
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const deleteMessageOp = async (id: string): Promise<boolean> => {
  if (!db || isMockMode) {
    let msgs = getMockMessagesDB();
    msgs = msgs.filter(m => m.id !== id);
    saveMockMessagesDB(msgs);
    return true;
  }

  try {
    await deleteDoc(doc(db, "messages", id));
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};

// --- STATS CALCULATION ---
export const fetchAdminStats = async (): Promise<AdminStats> => {
  const users = await fetchAllUsers();
  const messages = await fetchMessages();

  const stats = {
    totalUsers: users.length,
    totalMessages: messages.length,
    archetypeDistribution: {} as Record<string, number>,
    temperamentDistribution: {} as Record<string, number>
  };

  users.forEach(u => {
    const archName = u.archetype?.archetype || 'Unknown';
    if (u.archetype) stats.archetypeDistribution[archName] = (stats.archetypeDistribution[archName] || 0) + 1;
    
    const tempName = u.temperament?.temperament || 'Unknown';
    if (u.temperament) stats.temperamentDistribution[tempName] = (stats.temperamentDistribution[tempName] || 0) + 1;
  });

  return stats;
};

// --- AI REPORTS ---
export const generateCommunityReport = async () => {
  try {
    const stats = await fetchAdminStats();
    
    if (stats.totalUsers === 0) {
      return "No user data available for analysis yet.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this community data: 
      Total Users: ${stats.totalUsers}.
      Total Messages: ${stats.totalMessages}.
      Archetypes: ${JSON.stringify(stats.archetypeDistribution)}.
      Temperaments: ${JSON.stringify(stats.temperamentDistribution)}.
      
      Provide a "Community Pulse Report".
      1. What is the dominant energy?
      2. What content should we create for them?
      3. A prediction for community growth.
      Keep it concise (under 150 words).`
    });

    return response.text;
  } catch (e) {
    console.error(e);
    return "Could not generate AI report at this time. Please check your network connection.";
  }
};