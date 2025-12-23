
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, Droplets, Wind, Mountain,
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus, Ghost, Eye, Send, RotateCcw, Sunrise, Sunset, Coffee, ListChecks,
  Globe, Handshake, HeartOff, Landmark, History, Bell, BellOff, Info, Sparkle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight, getDailyOracleReflection, consultTheMirror, generateShadowWork, generateDailyBlueprint, analyzeDailyGrowth } from '../services/geminiService';
import { fetchMentors, Mentor, saveUserProgress, getUserProfile, DailyLog } from '../services/adminService';

const MODULES = [
  { id: 'personality', title: 'Personality Archetype', desc: 'Step 1: The Core Essence', icon: Fingerprint, color: 'purple', requiredFor: null },
  { id: 'temperament', title: 'Temperament Matrix', desc: 'Step 2: Biological Rhythms', icon: Activity, color: 'cyan', requiredFor: 'personality' },
  { id: 'ikigai', title: 'Ikigai Compass', desc: 'Step 3: Purpose Alignment', icon: Compass, color: 'pink', requiredFor: 'temperament' },
  { id: 'synthesis', title: 'Master Strategy', desc: 'Step 4: The Holistic Path', icon: Zap, color: 'indigo', requiredFor: 'ikigai' },
  { id: 'mirror', title: 'Mirror Chamber', desc: 'Daily Truth Dialogue', icon: Eye, color: 'blue', requiredFor: 'personality' },
  { id: 'shadow', title: 'Shadow Work', desc: 'Integration Rites', icon: Ghost, color: 'slate', requiredFor: 'synthesis' },
  { id: 'identity', title: 'Sanctuary Identity', desc: 'Final Designation', icon: Star, color: 'amber', requiredFor: 'personality' }
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
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Consulting the Oracle</p>
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

  const bgStyles = useMemo(() => {
    const temp = userData.temperament?.temperament?.toLowerCase() || '';
    if (temp.includes('choleric')) return 'from-orange-950/20 via-black to-red-950/20';
    if (temp.includes('sanguine')) return 'from-cyan-950/20 via-black to-yellow-950/10';
    if (temp.includes('melancholic')) return 'from-indigo-950/30 via-black to-purple-950/20';
    if (temp.includes('phlegmatic')) return 'from-emerald-950/20 via-black to-teal-950/20';
    return 'from-slate-900 via-black to-slate-900';
  }, [userData.temperament]);

  const currentInitiationStep = useMemo(() => {
    if (!userData.archetype) return 'personality';
    if (!userData.temperament) return 'temperament';
    if (!userData.ikigai) return 'ikigai';
    if (!userData.synthesis) return 'synthesis';
    return 'complete';
  }, [userData]);

  const nextStepModule = useMemo(() => {
    return MODULES.find(m => m.id === currentInitiationStep);
  }, [currentInitiationStep]);

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

  const handleBackToHub = () => {
      setActiveModule(null);
      setError(null);
      setLoading(false); // Force clear stuck loaders
  };

  const renderActiveModule = () => {
      if (loading) return <DynamicLoader text={loadingMessage} />;
      
      switch(activeModule) {
          case 'personality':
              return !userData.archetype ? <QuizView title="Personality" questions={PERSONALITY_QUESTIONS} onComplete={(a:any) => { setLoading(true); analyzePersonality(a.join('; '), '').then(r => r.success && (setUserData({...userData, archetype: r.data}), saveProgress({archetype: r.data}))).finally(() => setLoading(false)); }} color="purple" icon={<Fingerprint className="text-purple-500"/>} /> : <ComprehensiveResultView title="Archetype Analysis" data={userData.archetype} color="purple" onNext={handleBackToHub} onReset={() => saveProgress({archetype: null}).then(() => setUserData({...userData, archetype: null}))} />;
          case 'temperament':
              return !userData.temperament ? <QuizView title="Temperament" questions={TEMPERAMENT_QUESTIONS} onComplete={(a:any) => { setLoading(true); analyzeTemperament(a.join('; '), '').then(r => r.success && (setUserData({...userData, temperament: r.data}), saveProgress({temperament: r.data}))).finally(() => setLoading(false)); }} color="cyan" icon={<Activity className="text-cyan-500"/>} /> : <ComprehensiveResultView title="Temperament Analysis" data={userData.temperament} color="cyan" onNext={handleBackToHub} onReset={() => saveProgress({temperament: null}).then(() => setUserData({...userData, temperament: null}))} />;
          case 'ikigai':
              return !userData.ikigai ? <IkigaiForm onSubmit={(l:any,g:any,n:any,p:any) => { setLoading(true); generateIkigaiInsight(l,g,n,p).then(r => r.success && (setUserData({...userData, ikigai: r.data}), saveProgress({ikigai: r.data}))).finally(() => setLoading(false)); }} /> : <ComprehensiveResultView title="Ikigai" data={userData.ikigai} color="pink" onNext={handleBackToHub} onReset={() => saveProgress({ikigai: null}).then(() => setUserData({...userData, ikigai: null}))} />;
          case 'synthesis':
              return !userData.synthesis ? <SynthesisForm onSubmit={(f:any) => { setLoading(true); generateLifeSynthesis({...userData, ...f}).then(r => r.success && (setUserData({...userData, ...f, synthesis: r.data}), saveProgress({...f, synthesis: r.data}))).finally(() => setLoading(false)); }} data={userData} /> : <SynthesisResultView data={userData.synthesis} onBack={handleBackToHub} onReset={() => saveProgress({synthesis: null}).then(() => setUserData({...userData, synthesis: null}))} />;
          case 'mirror': return <MirrorChamberView profile={userData} onBack={handleBackToHub} />;
          case 'shadow': return !userData.shadowWork ? <ShadowReadinessView onGenerate={() => { setLoading(true); generateShadowWork(userData).then(res => res.success && setUserData({...userData, shadowWork: res.data})).finally(() => setLoading(false)); }} /> : <ShadowWorkView data={userData.shadowWork} onBack={handleBackToHub} onReset={() => saveProgress({shadowWork: null}).then(() => setUserData({...userData, shadowWork: null}))} />;
          case 'identity': return <IdentityView data={userData} onGenerate={() => { setLoading(true); generateNickname(userData.archetype?.archetype || 'Seeker').then(n => setUserData({...userData, nickname: n})).finally(() => setLoading(false)); }} onBack={handleBackToHub} />;
          default: return null;
      }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-1000 bg-gradient-to-br ${bgStyles}`}>
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="mb-8 space-y-12 animate-fade-in">
                {/* Simplified Header with Initiation Path */}
                <div className="relative">
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-2xl gap-8">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-serif font-bold mb-2 text-white">The Sanctuary</h1>
                            <p className="text-gray-400 text-sm font-medium">
                                {userData.nickname || "Traveler"}, {currentInitiationStep === 'complete' ? "Your path is clear." : "Begin your initiation."}
                            </p>
                        </div>

                        {/* Initiation Progress Map */}
                        <div className="flex-1 max-w-xl w-full">
                            <div className="flex justify-between relative mb-2">
                                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 -z-10"></div>
                                {['personality', 'temperament', 'ikigai', 'synthesis'].map((step, idx) => {
                                    const isDone = !!userData[step];
                                    const isCurrent = currentInitiationStep === step;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-2 group">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : isCurrent ? 'bg-purple-600 border-purple-600 text-white animate-pulse shadow-[0_0_20px_rgba(147,51,234,0.5)]' : 'bg-black border-white/20 text-white/30'}`}>
                                                {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-emerald-500' : isCurrent ? 'text-white' : 'text-gray-600'}`}>{step.charAt(0)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Primary Action Focus for New Users */}
                {currentInitiationStep !== 'complete' && (
                    <div 
                        onClick={() => setActiveModule(currentInitiationStep)}
                        className="group relative cursor-pointer overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-cyan-900/40 p-1 backdrop-blur-xl hover:scale-[1.01] transition-all shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                            <div className={`w-24 h-24 rounded-[2rem] bg-${nextStepModule?.color}-500/20 text-${nextStepModule?.color}-400 flex items-center justify-center shrink-0 shadow-inner border border-white/10 group-hover:rotate-12 transition-transform`}>
                                {nextStepModule && <nextStepModule.icon className="w-10 h-10" />}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className={`text-xs font-bold uppercase tracking-[0.4em] text-${nextStepModule?.color}-400 mb-2 block`}>Immediate Rite</span>
                                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">{nextStepModule?.title}</h2>
                                <p className="text-gray-300 text-lg max-w-xl leading-relaxed italic">"{nextStepModule?.desc}. This step is required to unlock deeper chambers of the sanctuary."</p>
                            </div>
                            <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-white text-black group-hover:scale-110 transition-transform shadow-2xl">
                                <ArrowIcon className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Secondary Features - Conditionally unlocked/simplified */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Daily Oracle / Reflection Card */}
                    <div className="lg:col-span-8 space-y-8">
                        {userData.archetype ? (
                             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600/80 to-indigo-600/80 px-8 py-5 text-white flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Today's Objective</span>
                                        <h2 className="text-xl font-serif font-bold">{dailyBlueprint?.theme || "Generating..."}</h2>
                                    </div>
                                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-md text-xs font-bold transition-colors">
                                        {showReviewForm ? "Return" : "Sunset Review"}
                                    </button>
                                </div>
                                <div className="p-8">
                                    {showReviewForm ? (
                                        <div className="animate-fade-in space-y-6">
                                             <textarea 
                                                value={reviewReport}
                                                onChange={e => setReviewReport(e.target.value)}
                                                placeholder="What did you learn today?"
                                                className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 ring-purple-500 transition-all resize-none"
                                            />
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex gap-2">
                                                    {[1,2,3,4,5].map(v => (
                                                        <button key={v} onClick={() => setEnergyLevel(v)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${energyLevel === v ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-500'}`}>{v}</button>
                                                    ))}
                                                </div>
                                                <button onClick={handleDailyReview} disabled={!reviewReport.trim()} className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 transition-all">Seal Reflection</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <BlueprintTask icon={<Coffee />} title="Morning" task={dailyBlueprint?.morning.task} color="orange" />
                                            <BlueprintTask icon={<Sun />} title="Midday" task={dailyBlueprint?.afternoon.task} color="yellow" />
                                            <BlueprintTask icon={<Sunset />} title="Evening" task={dailyBlueprint?.evening.task} color="indigo" />
                                        </div>
                                    )}
                                </div>
                             </div>
                        ) : (
                            <div className="bg-black/20 border border-dashed border-white/10 rounded-[3rem] p-12 text-center">
                                <Sparkle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <h3 className="text-xl font-serif font-bold text-white/40">Daily Rites are locked.</h3>
                                <p className="text-gray-600 text-sm max-w-xs mx-auto">Complete the Personality Archetype initiation to receive your first daily blueprint.</p>
                            </div>
                        )}

                        {/* Remaining Modules Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {MODULES.filter(m => m.id !== currentInitiationStep).map(m => {
                                const isDone = !!userData[m.id];
                                const isLocked = m.requiredFor ? !userData[m.requiredFor] : false;
                                return (
                                    <div 
                                        key={m.id} 
                                        onClick={() => !isLocked && setActiveModule(m.id)} 
                                        className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden ${isLocked ? 'opacity-40 grayscale pointer-events-none border-white/5' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-xl hover:-translate-y-1'}`}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <div className={`p-3 rounded-2xl bg-${m.color}-500/20 text-${m.color}-400`}><m.icon className="w-5 h-5"/></div>
                                            {isLocked ? <Lock className="w-4 h-4 text-gray-600"/> : isDone ? <Check className="w-4 h-4 text-emerald-500"/> : <Play className="w-4 h-4 text-white/20"/>}
                                        </div>
                                        <h3 className="text-lg font-bold font-serif text-white">{m.title}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{isLocked ? `Unlock ${m.requiredFor} first` : m.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="lg:col-span-4 bg-black/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 flex flex-col min-h-[500px]">
                        <div className="flex items-center gap-2 mb-8">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Growth Archive</span>
                        </div>
                        
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                            {userData.dailyLogs && userData.dailyLogs.length > 0 ? (
                                userData.dailyLogs.map((log: DailyLog, idx: number) => (
                                    <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-bold text-gray-500">{log.date}</span>
                                            <span className="text-[9px] font-bold text-emerald-400">{log.achievementScore}%</span>
                                        </div>
                                        <p className="text-[11px] text-gray-300 italic">"{log.growthSummary}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                                    <History className="w-12 h-12 mb-4" />
                                    <p className="text-xs uppercase tracking-widest font-bold">Archives Empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {activeModule && (
            <div className="animate-fade-in max-w-4xl mx-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
                {/* Unified Close Button - Always Accessible */}
                <button 
                    onClick={handleBackToHub} 
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90 z-50 group"
                    aria-label="Close module"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <button onClick={handleBackToHub} className="mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-purple-400 uppercase tracking-[0.2em] transition-colors"><ArrowLeft className="w-4 h-4"/> Return to Hub</button>
                
                {renderActiveModule()}
            </div>
        )}
      </div>
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
                <p className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-2 font-bold">Where the ego dissolves</p>
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
                    placeholder="Reflect here..."
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
    { id: 1, text: "A chaotic week ends. How do you truly reset your soul?", options: ["Gathering friends for loud celebration", "A quiet room, a book, and no noise", "Walking through a new, unknown street", "Organizing my desk and planning next week"] },
    { id: 2, text: "When facing a new project, what is your first instinct?", options: ["Visualizing the grand, final impact", "Listing the concrete steps to take", "Brainstorming infinite possibilities", "Analyzing potential risks and errors"] },
    { id: 3, text: "In a deep conversation, you tend to focus more on:", options: ["The underlying meaning and subtext", "The practical facts and literal words", "How the other person is feeling", "The logic and consistency of the argument"] },
    { id: 4, text: "Your ideal daily schedule is best described as:", options: ["A loose guide with room for inspiration", "A meticulously timed series of blocks", "Spontaneous bursts of hyper-focus", "Reliable routines that never change"] },
    { id: 5, text: "When a friend is in distress, your first response is to:", options: ["Offer immediate emotional warmth", "Problem-solve with objective logic", "Give them space to process alone", "Distract them with a change of scenery"] },
    { id: 6, text: "How do you view 'the rules' of society or work?", options: ["Essential structures for stability", "Suggestions that can be optimized", "Obstacles to true creative freedom", "Fair tools that should apply to everyone"] },
    { id: 7, text: "If you were to learn a new complex skill, you'd prefer:", options: ["Watching a master and imitating", "Reading the manual cover to cover", "Trial and error through doing", "Mapping the theory behind why it works"] },
    { id: 8, text: "Your biggest internal struggle is often:", options: ["Over-thinking every minor detail", "Acting on impulse without a plan", "Worrying about what others think", "Feeling detached from the real world"] },
    { id: 9, text: "In a group setting, you usually find yourself:", options: ["Leading the charge and delegating", "Quietly observing the dynamics", "Ensuring everyone feels included", "Challenging ideas to find the truth"] },
    { id: 10, text: "When you receive criticism, you mostly:", options: ["Take it personally and feel hurt", "Analyze it for practical use-cases", "Defend your vision and core intent", "Ignore it if it lacks logical merit"] },
    { id: 11, text: "How do you define personal success?", options: ["Impact and influence on the world", "Internal peace and self-mastery", "Security and comfort for loved ones", "Infinite growth and learning"] },
    { id: 12, text: "Your mind is naturally more like:", options: ["A library of facts and memories", "A web of patterns and connections", "A heart that mirrors others' needs", "A machine that seeks maximum efficiency"] }
];

const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "Your natural energy level upon waking is usually:", options: ["Instantly high and ready for action", "A slow build-up over several hours", "Dependent entirely on my mood", "Steady, calm, and unchanging"] },
    { id: 2, text: "When you get angry or frustrated, the emotion:", options: ["Explodes quickly and fades fast", "Smolders for a long time internally", "Is rare; I rarely get truly upset", "Makes me want to cry or withdraw"] },
    { id: 3, text: "Your typical speed of talking or moving is:", options: ["Fast, energetic, and sometimes hurried", "Moderate, deliberate, and controlled", "Slow, relaxed, and rhythmic", "Unpredictable; I alternate extremes"] },
    { id: 4, text: "How do you handle long periods of waiting?", options: ["I get restless and start pacing", "I use the time to think or plan", "I remain patient and unbothered", "I feel drained and slightly anxious"] },
    { id: 5, text: "Your social baseline is more like:", options: ["The life of the party, talking to everyone", "Selective; a few deep connections", "The observer, listening from the edge", "The peacemaker, avoiding any friction"] },
    { id: 6, text: "When working on a repetitive task, you:", options: ["Get bored and seek a new challenge", "Find a rhythm and stick to it", "Do it perfectly but feel exhausted", "Don't mind; it's relaxing for me"] },
    { id: 7, text: "Your memory for emotional events is:", options: ["I forget the bad stuff very quickly", "I remember every detail of the hurt", "I remember the lesson, not the feel", "I feel the emotion all over again"] },
    { id: 8, text: "If someone cuts you off in traffic, you likely:", options: ["Shout or gesture in immediate heat", "Analyze why they are such a bad driver", "Don't even notice or care much", "Feel startled and a bit shaken up"] },
    { id: 9, text: "Your favorite type of environment is:", options: ["Vibrant, colorful, and active", "Minimalist, quiet, and organized", "Cozy, soft, and comfortable", "Vast, open, and natural"] },
    { id: 10, text: "When you are stressed, you physically:", options: ["Need to run, move, or do something", "Get a headache or stiff shoulders", "Need to sleep or lie down immediately", "Want to eat or find physical comfort"] }
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
                    <button key={o} onClick={() => sel(o)} className="p-5 text-left border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white shadow-sm">
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
                <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4 font-bold">Core Strengths</h4>
                <ul className="space-y-2">{data.strengths?.map((s:string) => <li key={s} className="text-xs font-medium text-gray-300 flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0"/>{s}</li>)}</ul>
            </div>
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-4 font-bold">Shadow Paths</h4>
                <ul className="space-y-2">{(data.shadowSide || data.stressTriggers || data.weaknesses)?.map((s:string) => <li key={s} className="text-xs font-medium text-gray-300 flex gap-2"><Minus className="w-3 h-3 text-rose-400 shrink-0"/>{s}</li>)}</ul>
            </div>
        </div>
        <div className="flex gap-4 pt-6">
            <button onClick={onNext} className="flex-1 py-4 bg-white text-black rounded-2xl font-bold shadow-xl shadow-white/5 hover:scale-105 transition-all">Integrate Analysis</button>
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
            <button onClick={() => onSubmit(f.l, f.g, f.n, f.p)} className="w-full py-5 bg-white text-black rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">Align Compass</button>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, data }: any) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ age: data.age || '', principles: data.principles || '', likes: data.likes || '', dislikes: data.dislikes || '', region: data.region || '', religion: data.religion || '' });
    return (
        <div className="space-y-8 animate-fade-in max-w-lg mx-auto">
            <div className="text-center"><h3 className="text-3xl font-serif font-bold text-white">The Grand Synthesis</h3><p className="text-xs text-gray-500 uppercase tracking-widest mt-2 font-bold">Merging trait data into strategy</p></div>
            {step === 1 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input value={f.age} onChange={e => setF({...f, age:e.target.value})} placeholder="Age" className="p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm outline-none focus:ring-2 ring-indigo-500" />
                        <input value={f.region} onChange={e => setF({...f, region:e.target.value})} placeholder="Habitat" className="p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm outline-none focus:ring-2 ring-indigo-500" />
                    </div>
                    <input value={f.religion} onChange={e => setF({...f, religion:e.target.value})} placeholder="Guiding Philosophy" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm outline-none focus:ring-2 ring-indigo-500" />
                    <button onClick={() => setStep(2)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-500 transition-all">Next</button>
                </div>
            ) : (
                <div className="space-y-4">
                    <textarea value={f.likes} onChange={e => setF({...f, likes:e.target.value})} placeholder="Core Pleasures" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm h-20 outline-none focus:ring-2 ring-indigo-500" />
                    <textarea value={f.dislikes} onChange={e => setF({...f, dislikes:e.target.value})} placeholder="Core Frictions" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm h-20 outline-none focus:ring-2 ring-indigo-500" />
                    <textarea value={f.principles} onChange={e => setF({...f, principles:e.target.value})} placeholder="Inviolable Principles" className="w-full p-4 border border-white/10 rounded-xl bg-black/40 text-white text-sm h-24 outline-none focus:ring-2 ring-indigo-500" />
                    <button onClick={() => onSubmit(f)} className="w-full py-4 bg-white text-black rounded-xl font-bold shadow-lg hover:scale-105 transition-all">Generate Master Roadmap</button>
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
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 text-center mb-6 font-bold">Evolutionary Phases</h4>
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
            <button onClick={onBack} className="flex-1 py-5 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-all">Return to Sanctuary</button>
            <button onClick={onReset} className="px-8 py-5 border border-white/10 rounded-2xl font-bold text-gray-500">Recalculate</button>
        </div>
    </div>
);

const ShadowReadinessView = ({ onGenerate }: any) => (
    <div className="text-center py-16 space-y-8 animate-fade-in text-white">
        <div className="p-6 bg-white/5 border border-white/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-2xl"><Ghost className="w-12 h-12 text-gray-400 animate-pulse"/></div>
        <div>
            <h2 className="text-3xl font-serif font-bold mb-3">Entering the Shadow</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">Integrating the parts of yourself currently in darkness.</p>
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
            <button onClick={onBack} className="flex-1 py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-all">Exit Chamber</button>
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
                <p className="text-[10px] uppercase tracking-[0.4em] text-purple-400 relative z-10 font-bold">{data.archetype?.archetype || 'The Seeker'}</p>
                <div className="mt-10 pt-10 border-t border-white/10 text-[9px] uppercase tracking-[0.3em] opacity-30 relative z-10 font-bold">Sanctuary Node: {new Date().getFullYear()}</div>
            </div>
        )}
        <button onClick={onBack} className="text-xs text-gray-500 underline uppercase tracking-widest font-bold hover:text-white transition-colors">Return to Hub</button>
    </div>
);

export default DashboardPage;
