
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, Droplets, Wind, Mountain,
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus, Ghost, Eye, Send, RotateCcw, Sunrise, Sunset, Coffee, ListChecks,
  Globe, Handshake, HeartOff, Landmark, History, Bell, BellOff, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight, getDailyOracleReflection, consultTheMirror, generateShadowWork, generateDailyBlueprint, analyzeDailyGrowth } from '../services/geminiService';
import { fetchMentors, Mentor, saveUserProgress, getUserProfile, DailyLog } from '../services/adminService';

const MODULES = [
  { id: 'personality', title: 'Personality Archetype', desc: 'Jungian cognitive assessment', icon: Fingerprint, color: 'purple' },
  { id: 'temperament', title: 'Temperament Matrix', desc: 'Biological energy rhythm', icon: Activity, color: 'cyan' },
  { id: 'ikigai', title: 'Ikigai Compass', desc: 'Passion and purpose mapping', icon: Compass, color: 'pink' },
  { id: 'synthesis', title: 'Master Strategy', desc: 'Holistic lifecycle roadmap', icon: Zap, color: 'indigo' },
  { id: 'mirror', title: 'Mirror Chamber', desc: 'Real-time inner truth dialogue', icon: Eye, color: 'blue' },
  { id: 'shadow', title: 'Shadow Work', desc: 'Dark-side integration', icon: Ghost, color: 'slate' },
  { id: 'identity', title: 'Sanctuary Identity', desc: 'Mystical name reveal', icon: Star, color: 'amber' }
];

const DynamicLoader = ({ text }: { text: string }) => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => setDots(prev => prev.length < 3 ? prev + '.' : ''), 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in min-h-[400px]">
        <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin relative z-10" />
        </div>
        <p className="text-xl font-medium text-purple-900 dark:text-purple-100 animate-pulse text-center max-w-md">{text}{dots}</p>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Consulting the Oracle</p>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Results');
  const [userData, setUserData] = useState<any>({
    name: 'Traveler',
    archetype: null, temperament: null, ikigai: null, synthesis: null,
    age: '', principles: '', nickname: '', shadowWork: null,
    likes: '', dislikes: '', region: '', religion: '',
    streakCount: 0, dailyLogs: [], lastReflectionDate: null,
    notificationsEnabled: false
  });
  const [oracleReflection, setOracleReflection] = useState<any>(null);
  const [dailyBlueprint, setDailyBlueprint] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewReport, setReviewReport] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [lastLog, setLastLog] = useState<DailyLog | null>(null);

  // Dynamic Background Styles based on Temperament (Ambient UI)
  const bgStyles = useMemo(() => {
    const temp = userData.temperament?.temperament?.toLowerCase() || '';
    if (temp.includes('choleric')) return 'from-orange-950/20 via-black to-red-950/20'; // Fire
    if (temp.includes('sanguine')) return 'from-cyan-950/20 via-black to-yellow-950/10'; // Air
    if (temp.includes('melancholic')) return 'from-indigo-950/30 via-black to-purple-950/20'; // Earth
    if (temp.includes('phlegmatic')) return 'from-emerald-950/20 via-black to-teal-950/20'; // Water
    return 'from-slate-900 via-black to-slate-900';
  }, [userData.temperament]);

  useEffect(() => {
    let unsubscribe: any;
    const initData = async (uid: string) => {
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                setUserData(prev => ({ ...prev, ...profile }));
                if (profile.dailyLogs?.length > 0) {
                    setLastLog(profile.dailyLogs[0]);
                }
                if (profile.archetype || profile.temperament) {
                    const [oracleRes, blueprintRes] = await Promise.all([
                        getDailyOracleReflection(profile),
                        generateDailyBlueprint(profile)
                    ]);
                    if (oracleRes.success) setOracleReflection(oracleRes.data);
                    if (blueprintRes.success) setDailyBlueprint(blueprintRes.data);
                }
            }
        } catch (e) { console.error(e); }
    };
    if (auth) {
        unsubscribe = auth.onAuthStateChanged(user => {
            if (user) initData(user.uid);
            else {
                const local = localStorage.getItem('eunoia_user');
                if (local) initData(JSON.parse(local).uid);
                else navigate('/login');
            }
        });
    }
    return () => unsubscribe?.();
  }, [navigate]);

  const saveProgress = async (newData: any) => {
      const uid = auth?.currentUser?.uid || JSON.parse(localStorage.getItem('eunoia_user') || '{}').uid;
      if (uid) await saveUserProgress(uid, newData);
  };

  const toggleNotifications = async () => {
      if (!("Notification" in window)) return alert("Not supported.");
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
          const newState = !userData.notificationsEnabled;
          setUserData({ ...userData, notificationsEnabled: newState });
          await saveProgress({ notificationsEnabled: newState });
      }
  };

  const handleDailyReview = async () => {
    if (!reviewReport.trim()) return;
    setLoading(true);
    setLoadingMessage('Synthesizing Daily Growth');
    
    const res = await analyzeDailyGrowth(userData, dailyBlueprint, reviewReport, energyLevel);
    if (res.success && res.data) {
        const todayStr = new Date().toISOString().split('T')[0];
        const isNewDay = userData.lastReflectionDate !== todayStr;
        const newStreak = isNewDay ? (userData.streakCount || 0) + 1 : (userData.streakCount || 0);
        
        const newLog: DailyLog = {
            date: todayStr,
            blueprintTheme: dailyBlueprint.theme,
            userReport: reviewReport,
            growthSummary: res.data.growthSummary,
            achievementScore: res.data.achievementScore
        };
        
        const updatedLogs = [newLog, ...(userData.dailyLogs || [])].slice(0, 30);
        const updates = { streakCount: newStreak, lastReflectionDate: todayStr, dailyLogs: updatedLogs };
        
        setUserData({ ...userData, ...updates });
        setLastLog(newLog);
        await saveProgress(updates);
        setShowReviewForm(false);
        setReviewReport('');
    } else {
        setError(res.error || "Failed to analyze.");
    }
    setLoading(false);
  };

  const renderActiveModule = () => {
      if (loading) return <DynamicLoader text={loadingMessage} />;
      const handleBack = () => { setActiveModule(null); setError(null); };
      
      switch(activeModule) {
          case 'personality':
              return !userData.archetype ? <QuizView title="Personality" questions={PERSONALITY_QUESTIONS} onComplete={(a:any) => analyzePersonality(a.join('; '), '').then(r => r.success && (setUserData({...userData, archetype: r.data}), saveProgress({archetype: r.data})))} color="purple" icon={<Fingerprint className="text-purple-500"/>} /> : <ComprehensiveResultView title="Archetype Analysis" data={userData.archetype} color="purple" onNext={handleBack} onReset={() => saveProgress({archetype: null}).then(() => setUserData({...userData, archetype: null}))} />;
          case 'temperament':
              return !userData.temperament ? <QuizView title="Temperament" questions={TEMPERAMENT_QUESTIONS} onComplete={(a:any) => analyzeTemperament(a.join('; '), '').then(r => r.success && (setUserData({...userData, temperament: r.data}), saveProgress({temperament: r.data})))} color="cyan" icon={<Activity className="text-cyan-500"/>} /> : <ComprehensiveResultView title="Temperament Analysis" data={userData.temperament} color="cyan" onNext={handleBack} onReset={() => saveProgress({temperament: null}).then(() => setUserData({...userData, temperament: null}))} />;
          case 'ikigai':
              return !userData.ikigai ? <IkigaiForm onSubmit={(l:any,g:any,n:any,p:any) => generateIkigaiInsight(l,g,n,p).then(r => r.success && (setUserData({...userData, ikigai: r.data}), saveProgress({ikigai: r.data})))} /> : <ComprehensiveResultView title="Ikigai" data={userData.ikigai} color="pink" onNext={handleBack} onReset={() => saveProgress({ikigai: null}).then(() => setUserData({...userData, ikigai: null}))} />;
          case 'synthesis':
              return !userData.synthesis ? <SynthesisForm onSubmit={(f:any) => generateLifeSynthesis({...userData, ...f}).then(r => r.success && (setUserData({...userData, ...f, synthesis: r.data}), saveProgress({...f, synthesis: r.data})))} data={userData} /> : <SynthesisResultView data={userData.synthesis} onBack={handleBack} onReset={() => saveProgress({synthesis: null}).then(() => setUserData({...userData, synthesis: null}))} />;
          case 'mirror': return <MirrorChamberView profile={userData} onBack={handleBack} />;
          case 'shadow': return !userData.shadowWork ? <ShadowReadinessView onGenerate={() => generateShadowWork(userData).then(res => res.success && setUserData({...userData, shadowWork: res.data}))} /> : <ShadowWorkView data={userData.shadowWork} onBack={handleBack} onReset={() => saveProgress({shadowWork: null}).then(() => setUserData({...userData, shadowWork: null}))} />;
          case 'identity': return <IdentityView data={userData} onGenerate={() => generateNickname(userData.archetype?.archetype || 'Seeker').then(n => setUserData({...userData, nickname: n}))} onBack={handleBack} />;
          default: return null;
      }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-1000 bg-gradient-to-br ${bgStyles}`}>
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="mb-8 space-y-8 animate-fade-in">
                {/* Hub Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-serif font-bold mb-1 text-white">The Sanctuary Hub</h1>
                        <p className="text-gray-400 text-xs font-medium tracking-wide">
                            {userData.nickname || "Traveler"}, you have walked {userData.streakCount || 0} days on this path.
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={toggleNotifications} className={`p-4 rounded-2xl transition-all shadow-md ${userData.notificationsEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-500 opacity-60'}`}>
                            {userData.notificationsEnabled ? <Bell className="w-6 h-6 animate-swing" /> : <BellOff className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Streak</div>
                                <div className="text-2xl font-bold text-orange-500">{userData.streakCount || 0} Days</div>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center justify-center text-white ${(userData.streakCount || 0) > 0 ? 'animate-pulse' : 'opacity-40 grayscale'}`}>
                                <Flame className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Journey & Blueprint Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Blueprint Card */}
                    <div className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 px-8 py-5 text-white flex justify-between items-center backdrop-blur-md">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Today's Blueprint</span>
                                <h2 className="text-xl font-serif font-bold">{dailyBlueprint?.theme || "Generating..."}</h2>
                            </div>
                            <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md text-xs font-bold transition-colors">
                                {showReviewForm ? "Return to Rites" : "Sunset Review"}
                            </button>
                        </div>

                        <div className="p-8">
                            {showReviewForm ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-bold flex items-center gap-2 text-white"><Moon className="w-5 h-5 text-orange-400"/> Reflect on your Day</h3>
                                            <p className="text-xs text-gray-500">How did you stick to the Blueprint objective today?</p>
                                            <textarea 
                                                value={reviewReport}
                                                onChange={e => setReviewReport(e.target.value)}
                                                placeholder="Write freely..."
                                                className="w-full h-40 p-4 bg-black/40 border border-white/10 rounded-2xl text-sm text-white outline-none focus:ring-2 ring-purple-500 transition-all resize-none"
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="font-bold flex items-center gap-2 text-white"><Activity className="w-5 h-5 text-cyan-400"/> Soul Energy State</h3>
                                            <div className="p-6 bg-black/40 rounded-2xl border border-white/10 text-center">
                                                <div className="flex justify-between mb-4">
                                                    {[1,2,3,4,5].map(v => (
                                                        <button 
                                                            key={v} 
                                                            onClick={() => setEnergyLevel(v)}
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${energyLevel === v ? 'bg-purple-600 text-white shadow-lg scale-110' : 'bg-white/5 text-gray-500'}`}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">How much internal energy did you expend today?</p>
                                            </div>
                                            <button 
                                                onClick={handleDailyReview}
                                                disabled={loading || !reviewReport.trim()}
                                                className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                {loading ? <Loader2 className="animate-spin"/> : <><Sparkles className="w-5 h-5"/> Archive Growth</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-4 h-4 text-purple-400" />
                                            <span className="text-[10px] font-bold uppercase text-purple-400">Primary Rite</span>
                                        </div>
                                        <p className="text-gray-200 text-sm font-medium italic">"{dailyBlueprint?.objective || 'The Oracle is speaking...'}"</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <BlueprintTask icon={<Coffee />} title="Morning" task={dailyBlueprint?.morning.task} color="orange" />
                                        <BlueprintTask icon={<Sun />} title="Midday" task={dailyBlueprint?.afternoon.task} color="yellow" />
                                        <BlueprintTask icon={<Sunset />} title="Reflection" task={dailyBlueprint?.evening.task} color="indigo" />
                                    </div>
                                    <div className="mt-8 p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5">
                                        <div className="p-3 bg-white/10 rounded-xl"><Info className="w-4 h-4 text-gray-400"/></div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Mindset Shift</div>
                                            <p className="text-xs text-gray-400">Move from <span className="text-rose-400 font-bold">{dailyBlueprint?.mindsetShift.from}</span> to <span className="text-emerald-400 font-bold">{dailyBlueprint?.mindsetShift.to}</span></p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Growth Timeline Card (Visual achievement progress) */}
                    <div className="lg:col-span-4 bg-black/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Growth Constellation</span>
                        </div>
                        
                        {/* Spark Chart */}
                        <div className="flex items-end justify-between h-16 gap-1 mb-6 px-1">
                            {userData.dailyLogs && userData.dailyLogs.slice(0, 10).reverse().map((log: DailyLog, i: number) => (
                                <div key={i} className="flex-1 group relative">
                                    <div 
                                        className="w-full bg-cyan-500/40 rounded-t-sm transition-all group-hover:bg-cyan-400 group-hover:scale-y-110" 
                                        style={{ height: `${log.achievementScore}%` }}
                                    ></div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-900 text-[8px] font-bold text-cyan-100 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        {log.achievementScore}%
                                    </div>
                                </div>
                            ))}
                            {(!userData.dailyLogs || userData.dailyLogs.length < 10) && Array.from({ length: 10 - (userData.dailyLogs?.length || 0) }).map((_, i) => (
                                <div key={`empty-${i}`} className="flex-1 bg-white/5 h-1 rounded-full"></div>
                            ))}
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {userData.dailyLogs && userData.dailyLogs.length > 0 ? (
                                userData.dailyLogs.map((log: DailyLog, idx: number) => (
                                    <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-gray-500">{log.date}</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-cyan-400">{log.achievementScore}%</span>
                                            </div>
                                        </div>
                                        <h4 className="text-xs font-bold text-white mb-1">{log.blueprintTheme}</h4>
                                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed italic">"{log.growthSummary}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
                                    <History className="w-10 h-10 text-white mb-4" />
                                    <p className="text-xs text-white">The constellations are aligning.<br/>Log your first day.</p>
                                </div>
                            )}
                        </div>
                        {oracleReflection && !showReviewForm && (
                            <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3 h-3 text-purple-400"/>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Oracle Rite</span>
                                </div>
                                <p className="text-xs text-gray-300 font-serif leading-relaxed italic">"{oracleReflection.dailyRite}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MODULES.map(m => {
                        const done = userData[m.id];
                        const locked = (m.id === 'temperament' && !userData.archetype) || (m.id === 'ikigai' && !userData.temperament) || (m.id === 'synthesis' && !userData.ikigai);
                        return (
                            <div key={m.id} onClick={() => !locked && setActiveModule(m.id)} className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden ${locked ? 'opacity-40 bg-white/5 border-white/5' : 'hover:shadow-2xl hover:-translate-y-1 bg-white/10 backdrop-blur-xl border-white/10'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-4 rounded-2xl bg-${m.color}-500/20 text-${m.color}-400 transition-transform group-hover:scale-110`}><m.icon className="w-6 h-6"/></div>
                                    {locked ? <Lock className="w-5 h-5 text-gray-600"/> : done ? <Check className="w-5 h-5 text-emerald-500"/> : <Play className="w-5 h-5 text-purple-400 animate-pulse"/>}
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-1 text-white">{m.title}</h3>
                                <p className="text-xs text-gray-400 mb-4">{m.desc}</p>
                                <span className={`text-[10px] font-bold uppercase tracking-widest text-${m.color}-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all`}>
                                    {locked ? 'Locked' : done ? 'Review Analysis' : 'Begin Initiation'} <ChevronRight className="w-3 h-3"/>
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
        
        {activeModule && (
            <div className="animate-fade-in max-w-4xl mx-auto bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <button onClick={() => setActiveModule(null)} className="mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-purple-400 uppercase tracking-[0.2em] transition-colors"><ArrowLeft className="w-4 h-4"/> Back to Sanctuary</button>
                {renderActiveModule()}
            </div>
        )}
      </div>
      <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          @keyframes swing {
              0%, 100% { transform: rotate(0); }
              20% { transform: rotate(15deg); }
              40% { transform: rotate(-10deg); }
              60% { transform: rotate(5deg); }
              80% { transform: rotate(-5deg); }
          }
          .animate-swing { animation: swing 2s ease-in-out infinite; }
          
          @keyframes mirror-pulse {
              0%, 100% { transform: scale(1); opacity: 0.1; }
              50% { transform: scale(1.05); opacity: 0.2; }
          }
          .animate-mirror { animation: mirror-pulse 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const MirrorChamberView = ({ profile, onBack }: { profile: any, onBack: () => void }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        const res = await consultTheMirror(userMsg, profile);
        if (res.success && res.data) {
            setMessages(prev => [...prev, { 
                role: 'mirror', 
                reflection: res.data.reflection, 
                question: res.data.question 
            }]);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[600px] animate-fade-in relative">
            <div className="text-center mb-8 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-mirror"></div>
                <div className="inline-flex p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]"><Eye className="w-8 h-8"/></div>
                <h3 className="text-3xl font-serif font-bold text-white">The Mirror Chamber</h3>
                <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-2">Where the ego dissolves</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-6 custom-scrollbar pb-10">
                {messages.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                        <div className="w-px h-12 bg-indigo-500/50 mx-auto mb-6"></div>
                        <p className="text-sm italic text-indigo-300 font-serif">"The mirror waits for your words.<br/>What is weighing on your soul?"</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        {m.role === 'user' ? (
                            <div className="max-w-[80%] p-4 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl rounded-tr-none text-sm font-medium shadow-lg">
                                {m.content}
                            </div>
                        ) : (
                            <div className="max-w-[85%] p-6 bg-indigo-950/30 backdrop-blur-xl border border-indigo-500/20 rounded-3xl rounded-tl-none space-y-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">
                                    <RotateCcw className="w-3 h-3" /> Reflection
                                </div>
                                <p className="text-sm font-serif italic text-indigo-100/70">"... {m.reflection}"</p>
                                <div className="h-px bg-indigo-500/20 w-12"></div>
                                <p className="text-lg font-bold text-indigo-300 leading-relaxed font-serif">{m.question}</p>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="p-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-indigo-500/60 flex items-center gap-2">
                           <Loader2 className="w-3 h-3 animate-spin"/> Tuning Reflection...
                        </div>
                    </div>
                )}
                <div ref={scrollRef}></div>
            </div>

            <div className="relative group mt-auto">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="I feel that I am losing focus..."
                    className="w-full p-5 pl-6 pr-16 bg-black/40 border border-white/10 rounded-[2rem] text-white outline-none focus:ring-2 ring-indigo-500/50 transition-all text-sm placeholder:text-gray-600"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-3 top-3 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const BlueprintTask = ({ icon, title, task, color }: any) => (
    <div className="flex flex-col items-center text-center p-5 bg-white/5 rounded-[2rem] border border-white/5 group hover:border-purple-500/30 transition-all hover:scale-[1.05] backdrop-blur-sm">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-500/20 text-${color}-400 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12`}>
            {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <div className="text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">{title}</div>
        <h4 className="font-bold text-sm text-gray-200 leading-tight">{task || "Consulting..."}</h4>
    </div>
);

const PERSONALITY_QUESTIONS = [
    { id: 1, text: "Exhausting week: How to recharge?", options: ["Friends & Fun", "Solitude & Book", "New Streets", "Productive Projects"] },
    { id: 2, text: "First look at art?", options: ["Details/Technique", "Mood/Meaning", "Skill Level", "Personal Feeling"] },
    { id: 3, text: "Friend's dilemma?", options: ["Logic Solution", "Emotional Support", "Deep Context", "Fun Distraction"] }
];
const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "Natural Energy Levels?", options: ["High/Active", "Bursts/Dips", "Steady/Calm", "Reserved/Low-key"] },
    { id: 2, text: "Sudden Problems?", options: ["Angry Action", "Optimistic Fluster", "Deep Analysis", "Wait & See"] }
];

const QuizView = ({ questions, onComplete, color, icon }: any) => {
    const [idx, setIdx] = useState(0);
    const [ans, setAns] = useState<string[]>([]);
    const sel = (o: string) => { const n = [...ans, o]; setAns(n); if (idx < questions.length - 1) setIdx(idx + 1); else onComplete(n); };
    return (
        <div className="space-y-8 animate-fade-in max-w-xl mx-auto">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-2">{icon} Step {idx+1} of {questions.length}</span>
                <span>{Math.round(((idx+1)/questions.length)*100)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all`} style={{width: `${((idx+1)/questions.length)*100}%`}}></div>
            </div>
            <h4 className="text-xl font-serif font-bold text-white">{questions[idx].text}</h4>
            <div className="grid gap-3">
                {questions[idx].options.map((o:string) => (
                    <button key={o} onClick={() => sel(o)} className="p-5 text-left border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white">
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ComprehensiveResultView = ({ title, data, color, onNext, onReset }: any) => (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto text-center">
        <span className={`px-4 py-1 bg-${color}-500/20 text-${color}-400 rounded-full text-[10px] font-bold uppercase tracking-widest`}>{title}</span>
        <h3 className="text-4xl font-serif font-bold text-white">{data.archetype || data.temperament || data.title}</h3>
        <p className="italic text-gray-400 font-serif">"{data.tagline || data.element || 'The Seeker'}"</p>
        <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] text-base leading-relaxed text-gray-300 italic">"{data.description || data.insight}"</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Core Strengths</h4>
                <ul className="space-y-2">{data.strengths?.map((s:string) => <li key={s} className="text-xs font-medium text-gray-300 flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0"/>{s}</li>)}</ul>
            </div>
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-4">Shadow Paths</h4>
                <ul className="space-y-2">{(data.shadowSide || data.stressTriggers || data.weaknesses)?.map((s:string) => <li key={s} className="text-xs font-medium text-gray-300 flex gap-2"><Minus className="w-3 h-3 text-rose-400 shrink-0"/>{s}</li>)}</ul>
            </div>
        </div>
        <div className="flex gap-4 pt-6">
            <button onClick={onNext} className="flex-1 py-4 bg-white text-black rounded-2xl font-bold shadow-xl shadow-white/5">Return to Hub</button>
            <button onClick={onReset} className="px-6 py-4 border border-white/10 rounded-2xl font-bold text-gray-500 hover:text-white transition-colors">Re-evaluate</button>
        </div>
    </div>
);

const IkigaiForm = ({ onSubmit }: any) => {
    const [f, setF] = useState({ l:'', g:'', n:'', p:'' });
    return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="text-center mb-8"><h3 className="text-3xl font-serif font-bold text-white">The Pillars of Purpose</h3></div>
            <div className="grid gap-4">
                <textarea value={f.l} onChange={e => setF({...f, l:e.target.value})} placeholder="What do you truly LOVE?" className="w-full p-4 border border-white/10 rounded-2xl bg-black/40 text-white text-sm h-24 outline-none focus:ring-2 ring-pink-500" />
                <textarea value={f.g} onChange={e => setF({...f, g:e.target.value})} placeholder="What are you naturally SKILLED at?" className="w-full p-4 border border-white/10 rounded-2xl bg-black/40 text-white text-sm h-24 outline-none focus:ring-2 ring-cyan-500" />
                <textarea value={f.n} onChange={e => setF({...f, n:e.target.value})} placeholder="What does the WORLD NEED?" className="w-full p-4 border border-white/10 rounded-2xl bg-black/40 text-white text-sm h-24 outline-none focus:ring-2 ring-emerald-500" />
                <textarea value={f.p} onChange={e => setF({...f, p:e.target.value})} placeholder="What can you be PAID FOR?" className="w-full p-4 border border-white/10 rounded-2xl bg-black/40 text-white text-sm h-24 outline-none focus:ring-2 ring-orange-500" />
            </div>
            <button onClick={() => onSubmit(f.l, f.g, f.n, f.p)} className="w-full py-5 bg-white text-black rounded-2xl font-bold shadow-xl">Align Compass</button>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, data }: any) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ age: data.age || '', principles: data.principles || '', likes: data.likes || '', dislikes: data.dislikes || '', region: data.region || '', religion: data.religion || '' });
    return (
        <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
            <div className="text-center"><h3 className="text-3xl font-serif font-bold text-white">The Grand Synthesis</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Merging trait data into strategy</p></div>
            {step === 1 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input value={f.age} onChange={e => setF({...f, age:e.target.value})} placeholder="Age" className="p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm outline-none focus:ring-2 ring-indigo-500" />
                        <input value={f.region} onChange={e => setF({...f, region:e.target.value})} placeholder="Habitat" className="p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm outline-none focus:ring-2 ring-indigo-500" />
                    </div>
                    <input value={f.religion} onChange={e => setF({...f, religion:e.target.value})} placeholder="Guiding Philosophy" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm outline-none focus:ring-2 ring-indigo-500" />
                    <button onClick={() => setStep(2)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Next</button>
                </div>
            ) : (
                <div className="space-y-4">
                    <textarea value={f.likes} onChange={e => setF({...f, likes:e.target.value})} placeholder="Core Pleasures" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm h-20 outline-none focus:ring-2 ring-indigo-500" />
                    <textarea value={f.dislikes} onChange={e => setF({...f, dislikes:e.target.value})} placeholder="Core Frictions" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm h-20 outline-none focus:ring-2 ring-indigo-500" />
                    <textarea value={f.principles} onChange={e => setF({...f, principles:e.target.value})} placeholder="Inviolable Principles" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm h-24 outline-none focus:ring-2 ring-indigo-500" />
                    <button onClick={() => onSubmit(f)} className="w-full py-4 bg-white text-black rounded-xl font-bold">Generate Master Roadmap</button>
                </div>
            )}
        </div>
    );
};

const SynthesisResultView = ({ data, onBack, onReset }: any) => (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
        <div className="text-center space-y-6">
            <h3 className="text-4xl font-serif font-bold text-white">The Unfolding Path</h3>
            <div className="p-8 bg-white/10 backdrop-blur-3xl text-white rounded-[2.5rem] italic font-serif text-2xl shadow-2xl relative border border-white/10">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                "{data.mantra}"
            </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-white">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-4">Strategic Leverage</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{data.strengthAnalysis}</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-4">Structural Friction</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{data.weaknessAnalysis}</p>
            </div>
        </div>
        <div className="space-y-4 pt-4 text-white">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 text-center mb-6">Evolutionary Phases</h4>
            {data.roadmap?.map((p: any, i: number) => (
                <div key={i} className="flex gap-6 items-start group">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-110 shadow-lg">{i+1}</div>
                    <div className="flex-1 pb-6 border-b border-white/5 last:border-0">
                        <h6 className="text-lg font-bold font-serif mb-1 group-hover:text-indigo-400 transition-colors">{p.goal}</h6>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">{p.phase}</p>
                        <ul className="flex flex-wrap gap-2">
                            {p.actions?.map((a:string) => (
                                <li key={a} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-medium text-gray-400">{a}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
        <div className="flex gap-4 pt-10">
            <button onClick={onBack} className="flex-1 py-5 bg-white text-black rounded-2xl font-bold">Return to Sanctuary</button>
            <button onClick={onReset} className="px-8 py-5 border border-white/10 rounded-2xl font-bold text-gray-500">Recalculate</button>
        </div>
    </div>
);

const ShadowReadinessView = ({ onGenerate }: any) => (
    <div className="text-center py-16 space-y-8 animate-fade-in text-white">
        <div className="p-6 bg-white/5 border border-white/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-2xl"><Ghost className="w-12 h-12 text-gray-400 animate-pulse"/></div>
        <div>
            <h2 className="text-3xl font-serif font-bold mb-3">Entering the Shadow</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">Integrating the parts of yourself currently in darkness.</p>
        </div>
        <button onClick={onGenerate} className="px-12 py-4 bg-white text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl">Reveal Shadow Portrait</button>
    </div>
);

const ShadowWorkView = ({ data, onBack, onReset }: any) => (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-10 text-white">
        <div className="text-center space-y-4">
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]">Shadow Integration</span>
            <h3 className="text-4xl font-serif font-bold">The Shadow Portrait</h3>
        </div>
        <div className="p-8 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold border-b border-white/5 pb-4">Repressed Traits</h4>
            <ul className="grid grid-cols-2 gap-4">{data.shadowTraits?.map((t:string) => <li key={t} className="text-sm font-serif italic text-gray-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"/>{t}</li>)}</ul>
        </div>
        <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Integration Rite</h4>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-sm leading-relaxed text-gray-400 font-medium">
                {data.theMirrorExercise}
            </div>
        </div>
        <div className="flex gap-4 pt-6">
            <button onClick={onBack} className="flex-1 py-4 bg-white text-black rounded-2xl font-bold">Exit Chamber</button>
            <button onClick={onReset} className="px-6 py-4 border border-white/10 rounded-2xl font-bold text-gray-500">Re-evaluate</button>
        </div>
    </div>
);

const IdentityView = ({ data, onGenerate, onBack }: any) => (
    <div className="flex flex-col items-center gap-12 py-12 animate-fade-in text-white">
        {!data.nickname ? (
            <div className="text-center space-y-8">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-2xl"><Shield className="w-10 h-10 text-gray-400"/></div>
                <h3 className="text-3xl font-serif font-bold">Claim your Sanctuary Name</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">The Oracle will assign you a mystical moniker based on your cognitive profile.</p>
                <button onClick={onGenerate} className="px-12 py-4 bg-white text-black rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all">Reveal Designation</button>
            </div>
        ) : (
            <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-[3.5rem] text-white text-center shadow-2xl border border-white/20 w-80 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-serif shadow-inner relative z-10 border border-white/20">{(data.nickname || 'S')[0]}</div>
                <h4 className="text-3xl font-serif font-bold mb-2 relative z-10">{data.nickname}</h4>
                <p className="text-[10px] uppercase tracking-[0.4em] text-purple-400 relative z-10">{data.archetype?.archetype || 'The Seeker'}</p>
                <div className="mt-10 pt-10 border-t border-white/10 text-[9px] uppercase tracking-[0.3em] opacity-30 relative z-10">Sanctuary Node: {new Date().getFullYear()}</div>
            </div>
        )}
        <button onClick={onBack} className="text-xs text-gray-500 underline uppercase tracking-widest font-bold hover:text-white transition-colors">Return to Hub</button>
    </div>
);

export default DashboardPage;
