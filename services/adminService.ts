
import { GoogleGenAI } from "@google/genai";
import { 
  collection, getDocs, doc, deleteDoc, updateDoc, 
  addDoc, setDoc, getDoc, query, orderBy 
} from "firebase/firestore";
import { db, isMockMode } from "./firebaseConfig";

// --- TYPES ---
export interface DailyLog {
  date: string;
  blueprintTheme: string;
  userReport: string;
  growthSummary: string;
  achievementScore: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  status: 'Active' | 'Banned';
  archetype?: any;
  temperament?: any;
  ikigai?: any;
  synthesis?: any;
  nickname?: string;
  bio?: string;
  pronouns?: string;
  location?: string;
  // Deep Personalization Fields
  likes?: string;
  dislikes?: string;
  region?: string;
  religion?: string;
  age?: string;
  principles?: string;
  // Growth Tracking
  streakCount: number;
  lastReflectionDate?: string; // ISO string
  dailyLogs: DailyLog[];
  // Reminders
  notificationsEnabled: boolean;
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

const loadLocal = <T>(key: string, def: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : def;
  } catch (e) { return def; }
};
const saveLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const adminAuth = {
  login: (email: string, pass: string) => email === "admin@eunoia" && pass === "08022857727"
};

const getMockUsersDB = (): UserProfile[] => loadLocal('eunoia_users_db', []);
const saveMockUsersDB = (users: UserProfile[]) => saveLocal('eunoia_users_db', users);

export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  if (!db || isMockMode) return getMockUsersDB();
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  } catch (error) { return []; }
};

export const getUserProfile = async (id: string): Promise<UserProfile | null> => {
  if (!db || isMockMode) return getMockUsersDB().find(u => u.id === id) || null;
  try {
    const docSnap = await getDoc(doc(db, "users", id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as UserProfile : null;
  } catch (error) { return null; }
};

export const updateUserProfile = async (id: string, data: Partial<UserProfile>): Promise<boolean> => {
    if (!db || isMockMode) {
        const users = getMockUsersDB();
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) { users[idx] = { ...users[idx], ...data }; saveMockUsersDB(users); return true; }
        return false;
    }
    try { await setDoc(doc(db, "users", id), data, { merge: true }); return true; }
    catch (e) { return false; }
}

export const saveUserProgress = async (userId: string, data: Partial<UserProfile>) => {
  if (!userId) return;
  if (!db || isMockMode) {
     const users = getMockUsersDB();
     const idx = users.findIndex(u => u.id === userId);
     if (idx >= 0) users[idx] = { ...users[idx], ...data };
     else users.push({ 
       id: userId, 
       name: 'User', 
       email: 'user@example.com', 
       joinedDate: new Date().toLocaleDateString(), 
       status: 'Active',
       streakCount: 0,
       dailyLogs: [],
       notificationsEnabled: false,
       ...data 
     } as UserProfile);
     saveMockUsersDB(users);
     return;
  }
  try { await setDoc(doc(db, "users", userId), data, { merge: true }); }
  catch (error) { throw error; }
};

export const deleteUserOp = async (id: string): Promise<boolean> => {
  if (!db || isMockMode) {
    const users = getMockUsersDB();
    saveMockUsersDB(users.filter(u => u.id !== id));
    return true;
  }
  try {
    await deleteDoc(doc(db, "users", id));
    return true;
  } catch (error) {
    return false;
  }
};

export const toggleUserStatusOp = async (id: string, currentStatus: string): Promise<boolean> => {
  const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
  if (!db || isMockMode) {
    const users = getMockUsersDB();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx].status = newStatus as 'Active' | 'Banned';
      saveMockUsersDB(users);
      return true;
    }
    return false;
  }
  try {
    await updateDoc(doc(db, "users", id), { status: newStatus });
    return true;
  } catch (error) {
    return false;
  }
};

export const fetchMentors = async (): Promise<Mentor[]> => {
  if (!db || isMockMode) return loadLocal('eunoia_mentors_db', []);
  try {
    const querySnapshot = await getDocs(collection(db, "mentors"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor));
  } catch (error) { return []; }
};

export const addMentorOp = async (mentor: Omit<Mentor, 'id'>): Promise<Mentor | null> => {
  if (!db || isMockMode) {
    const mentors = loadLocal<Mentor[]>('eunoia_mentors_db', []);
    const newMentor = { ...mentor, id: Date.now().toString() };
    mentors.push(newMentor); saveLocal('eunoia_mentors_db', mentors);
    return newMentor;
  }
  try {
    const docRef = await addDoc(collection(db, "mentors"), mentor);
    return { ...mentor, id: docRef.id };
  } catch (error) { return null; }
};

export const deleteMentorOp = async (id: string): Promise<boolean> => {
  if (!db || isMockMode) { 
    const mentors = loadLocal<Mentor[]>('eunoia_mentors_db', []);
    saveLocal('eunoia_mentors_db', mentors.filter(m => m.id !== id)); 
    return true; 
  }
  try { await deleteDoc(doc(db, "mentors", id)); return true; }
  catch (error) { return false; }
};

export const submitContactMessage = async (data: { name: string; email: string; message: string }) => {
  const newMessage = { id: Date.now().toString(), ...data, date: new Date().toLocaleString(), read: false };
  if (!db || isMockMode) {
    const msgs = loadLocal<ContactMessage[]>('eunoia_messages_db', []); 
    msgs.unshift(newMessage); saveLocal('eunoia_messages_db', msgs);
    return true;
  }
  try { await addDoc(collection(db, "messages"), newMessage); return true; }
  catch (error) { return false; }
};

export const fetchMessages = async (): Promise<ContactMessage[]> => {
  if (!db || isMockMode) return loadLocal('eunoia_messages_db', []);
  try {
    const q = query(collection(db, "messages"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
  } catch (error) { return []; }
};

export const deleteMessageOp = async (id: string): Promise<boolean> => {
  if (!db || isMockMode) {
    const msgs = loadLocal<ContactMessage[]>('eunoia_messages_db', []);
    saveLocal('eunoia_messages_db', msgs.filter(m => m.id !== id));
    return true;
  }
  try { await deleteDoc(doc(db, "messages", id)); return true; }
  catch (error) { return false; }
};

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const users = await fetchAllUsers();
  const messages = await fetchMessages();
  const stats = { totalUsers: users.length, totalMessages: messages.length, archetypeDistribution: {} as Record<string, number>, temperamentDistribution: {} as Record<string, number> };
  users.forEach(u => {
    if (u.archetype) stats.archetypeDistribution[u.archetype.archetype] = (stats.archetypeDistribution[u.archetype.archetype] || 0) + 1;
    if (u.temperament) stats.temperamentDistribution[u.temperament.temperament] = (stats.temperamentDistribution[u.temperament.temperament] || 0) + 1;
  });
  return stats;
};

export const generateCommunityReport = async () => {
  try {
    const stats = await fetchAdminStats();
    if (stats.totalUsers === 0) return "No user data available.";
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze: Users: ${stats.totalUsers}, Archetypes: ${JSON.stringify(stats.archetypeDistribution)}, Temperaments: ${JSON.stringify(stats.temperamentDistribution)}. Provide community pulse, content advice, and growth prediction.`
    });
    return response.text;
  } catch (e) { return "Could not generate AI report."; }
};
