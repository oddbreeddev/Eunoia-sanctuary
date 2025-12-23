
import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Edit2, Save, LogOut, Loader2, Sparkles, Brain, Activity, Compass, Fingerprint, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { getUserProfile, updateUserProfile, UserProfile } from '../services/adminService';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', pronouns: '', location: '' });

  useEffect(() => {
    let unsubscribe: any;
    
    const initProfile = async (uid: string, email: string | null, displayName: string | null) => {
        try {
            const data = await getUserProfile(uid);
            if (data) {
                setProfile(data);
                setEditForm({ 
                    name: data.name || 'Traveler', 
                    bio: data.bio || '',
                    pronouns: data.pronouns || '',
                    location: data.location || ''
                });
            } else {
                const fallback: UserProfile = {
                    id: uid,
                    name: displayName || 'Traveler',
                    email: email || '',
                    joinedDate: new Date().toLocaleDateString(),
                    status: 'Active',
                    streakCount: 0,
                    dailyLogs: [],
                    notificationsEnabled: false
                };
                setProfile(fallback);
                setEditForm({ 
                    name: fallback.name, 
                    bio: '', 
                    pronouns: '', 
                    location: '' 
                });
            }
        } catch (e) {
            console.error("Profile load error", e);
        } finally {
            setLoading(false);
        }
    };

    if (auth) {
        unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                initProfile(user.uid, user.email, user.displayName);
            } else {
                const localUser = localStorage.getItem('eunoia_user');
                if (localUser) {
                    const parsed = JSON.parse(localUser);
                    initProfile(parsed.uid, parsed.email, parsed.displayName);
                } else {
                    navigate('/login');
                }
            }
        });
    } else {
        const localUser = localStorage.getItem('eunoia_user');
        if (localUser) {
             const parsed = JSON.parse(localUser);
             initProfile(parsed.uid, parsed.email, parsed.displayName);
        } else {
             navigate('/login');
        }
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    const updated = { ...profile, ...editForm };
    setProfile(updated);
    await updateUserProfile(profile.id, editForm);
    setEditing(false);
    setLoading(false);
  };

  const handleLogout = () => {
      auth?.signOut();
      localStorage.removeItem('eunoia_user');
      navigate('/');
  };

  if (loading) return (
      <div className="min-h-screen pt-20 bg-slate-50 dark:bg-black flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4"/>
          <p className="text-gray-500 animate-pulse">Retrieving Archives...</p>
      </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-6">
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-10"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center mt-4">
                    <div className="w-28 h-28 bg-white dark:bg-black p-1 rounded-full shadow-lg mb-4">
                         <div className="w-full h-full bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900 rounded-full flex items-center justify-center overflow-hidden">
                             <span className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                                 {(profile.name || 'T').charAt(0)}
                             </span>
                         </div>
                    </div>
                    
                    {editing ? (
                        <div className="w-full space-y-3 mb-4 animate-fade-in">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold text-left block ml-1">Display Name</label>
                                <input 
                                    className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg text-center font-bold text-gray-900 dark:text-white"
                                    value={editForm.name}
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 text-left">
                                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Pronouns</label>
                                    <input 
                                        className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm text-gray-900 dark:text-white"
                                        value={editForm.pronouns}
                                        onChange={e => setEditForm({...editForm, pronouns: e.target.value})}
                                        placeholder="They/Them"
                                    />
                                </div>
                                <div className="flex-1 text-left">
                                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Location</label>
                                    <input 
                                        className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm text-gray-900 dark:text-white"
                                        value={editForm.location}
                                        onChange={e => setEditForm({...editForm, location: e.target.value})}
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                            <div className="text-left">
                                <label className="text-xs text-gray-500 uppercase font-bold ml-1">Bio</label>
                                <textarea 
                                    className="w-full p-2 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm text-gray-900 dark:text-white"
                                    value={editForm.bio}
                                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                                    placeholder="Short bio..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 justify-center flex-wrap">
                                {profile.name || 'Traveler'}
                                {profile.pronouns && <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{profile.pronouns}</span>}
                            </h2>
                            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-6 px-4">
                                {profile.bio || "No bio yet. Tap edit to add your story."}
                            </p>
                        </>
                    )}

                    <div className="w-full border-t border-gray-100 dark:border-white/10 pt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3 justify-center">
                            <Mail className="w-4 h-4 text-gray-400" /> {profile.email}
                        </div>
                        {profile.location && (
                            <div className="flex items-center gap-3 justify-center">
                                <MapPin className="w-4 h-4 text-gray-400" /> {profile.location}
                            </div>
                        )}
                        <div className="flex items-center gap-3 justify-center">
                            <Calendar className="w-4 h-4 text-gray-400" /> Joined {profile.joinedDate}
                        </div>
                    </div>

                    <div className="w-full mt-8 flex gap-3">
                         {editing ? (
                             <button 
                                onClick={handleSave} 
                                className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center gap-2 font-bold hover:opacity-90 transition-opacity"
                             >
                                <Save className="w-4 h-4" /> Save Changes
                             </button>
                         ) : (
                             <button 
                                onClick={() => setEditing(true)} 
                                className="flex-1 py-2.5 bg-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors border border-transparent dark:border-white/5"
                             >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                             </button>
                         )}
                         <button 
                            onClick={handleLogout} 
                            className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-100 dark:border-red-900/30"
                            title="Log Out"
                        >
                             <LogOut className="w-4 h-4" />
                         </button>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white/10 dark:to-white/5 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden border border-slate-700 dark:border-white/10">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400"/> Current Status
                </h3>
                <div className="text-3xl font-serif italic mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-cyan-200">
                    {profile.archetype?.archetype || "Initiate"}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-medium uppercase">
                        <span>Sanctuary Completion</span>
                        <span>{profile.synthesis ? '100%' : profile.ikigai ? '75%' : profile.temperament ? '50%' : profile.archetype ? '25%' : '0%'}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full transition-all duration-1000" 
                            style={{ width: profile.synthesis ? '100%' : profile.ikigai ? '75%' : profile.temperament ? '50%' : profile.archetype ? '25%' : '5%' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-3">
                        <Brain className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-wider">Archetype</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {profile.archetype?.archetype || "Not Analyzed"}
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-3">
                        <Activity className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-wider">Temperament</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {profile.temperament?.temperament || "Not Analyzed"}
                    </div>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:border-pink-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-3">
                        <Compass className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-wider">Ikigai</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                        {profile.ikigai?.title || "Not Analyzed"}
                    </div>
                </div>
            </div>

            {profile.synthesis ? (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                     <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase mb-4">
                                <Fingerprint className="w-3 h-3" /> Synthesis Complete
                            </div>
                            <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">
                                The {profile.synthesis.mantra ? "Path of Wisdom" : "Sanctuary Path"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                Your data has been synthesized into a comprehensive life strategy. This badge represents the unique intersection of your personality, biological rhythm, and purpose.
                            </p>
                            <div className="bg-gray-50 dark:bg-black/30 rounded-2xl p-5 border-l-4 border-emerald-500 mb-8">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">Your Life Mantra</h4>
                                <p className="text-xl font-serif italic text-gray-900 dark:text-white">"{profile.synthesis.mantra}"</p>
                            </div>
                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className="w-full md:w-auto px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                View Full Strategy <span className="text-xl">&rarr;</span>
                            </button>
                        </div>
                        <div className="w-full max-w-[280px] perspective-1000 group">
                           <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:rotate-y-12 group-hover:scale-105 border border-white/20 bg-black">
                               <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black"></div>
                               <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                               <div className="absolute inset-0 p-6 flex flex-col items-center text-center text-white z-10 justify-between">
                                    <div>
                                        <div className="text-[10px] tracking-[0.3em] font-serif opacity-70 mb-8">EUNOIA SANCTUARY</div>
                                        <div className="w-20 h-20 mx-auto rounded-full border border-white/30 flex items-center justify-center bg-white/5 backdrop-blur-sm mb-4">
                                            <span className="text-4xl font-serif">{(profile.name || 'T').charAt(0)}</span>
                                        </div>
                                        <div className="font-bold text-xl mb-1">{profile.nickname || (profile.name || 'Traveler').split(' ')[0]}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-purple-300">{profile.archetype?.archetype || "Seeker"}</div>
                                    </div>
                                    <div className="w-full space-y-3">
                                        <div className="flex justify-between text-[9px] uppercase opacity-60 border-b border-white/10 pb-1">
                                            <span>Type</span>
                                            <span>{profile.temperament?.temperament || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between text-[9px] uppercase opacity-60 border-b border-white/10 pb-1">
                                            <span>ID</span>
                                            <span>{profile.id.slice(-6)}</span>
                                        </div>
                                    </div>
                               </div>
                               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                           </div>
                        </div>
                     </div>
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Compass className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sanctuary Badge Locked</h3>
                    <p className="text-gray-500 mb-8 max-w-md">Complete Archetype, Temperament, and Ikigai to generate your unique Sanctuary Badge and Strategy.</p>
                    <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-500/30">Go to Dashboard</button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
