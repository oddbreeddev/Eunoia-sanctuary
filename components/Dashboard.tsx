
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, 
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus, Ghost, Eye, Send, RotateCcw, Sunrise, Sunset, Coffee, ListChecks,
  Globe, Handshake, HeartOff, Landmark, History, Bell, BellOff, Info, Sparkle, HelpCircle, Lightbulb as IdeaIcon, Copy, RefreshCw,
  Twitter, Share, Plus, Trash, ChevronDown, ChevronUp, Sparkle as SparkleIcon, FileText, ExternalLink, Volume2, Smile, Frown, Meh
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight, consultTheMirror, generateShadowWork, generateDailyBlueprint, analyzeDailyGrowth, generateDailyAffirmation, generateSoulAura, generateAudioAffirmation } from '../services/geminiService';
import { saveUserProgress, getUserProfile, DailyLog, DailyGoal } from '../services/adminService';

const DynamicLoader = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center space-y-4">
    <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
    <p className="text-gray-500 animate-pulse font-medium tracking-wide">{text}...</p>
    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Consulting the Oracle</p>
  </div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Results');
  const [mood, setMood] = useState('calm');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [userData, setUserData] = useState<any>({
    name: 'User', archetype: null, temperament: null, ikigai: null, synthesis: null, auraImage: null,
    age: '', principles: '', nickname: '', shadowWork: null,
    streakCount: 0, dailyLogs: [], dailyGoals: [], lastReflectionDate: null
  });
  const [dailyBlueprint, setDailyBlueprint] = useState<any>(null);
  const [dailyAffirmationText, setDailyAffirmationText] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewReport, setReviewReport] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [shadowJournal, setShadowJournal] = useState('');

  useEffect(() => {
    let unsubscribe: any;
    const initData = async (uid: string) => {
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                setUserData(prev => ({ ...prev, ...profile }));
                if (profile.archetype || profile.temperament) {
                    generateDailyBlueprint(profile, mood).then(r => r.success && setDailyBlueprint(r.data));
                    generateDailyAffirmation(profile).then(r => r.success && setDailyAffirmationText(r.data.affirmation));
                }
            }
        } catch (e) { console.error(e); }
    };
    if (auth) {
        unsubscribe = auth.onAuthStateChanged(user => {
            if (user) initData(user.uid);
            else navigate('/login');
        });
    }
    return () => unsubscribe?.();
  }, [navigate, mood]);

  const handlePlayAffirmation = async () => {
    if (!dailyAffirmationText || isPlayingAudio) return;
    setIsPlayingAudio(true);
    const audioData = await generateAudioAffirmation(dailyAffirmationText);
    if (audioData) {
        const audio = new Audio(`data:audio/pcm;base64,${audioData}`);
        // Note: PCM audio requires proper decoding. For MVP, we'll use a simplified decoding approach.
        // In a production environment, use the AudioContext decode logic from the guidelines.
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const binaryString = window.atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
    } else {
        setIsPlayingAudio(false);
    }
  };

  const handleShadowRitual = async () => {
      setLoading(true);
      setLoadingMessage("Integrating your shadows");
      const res = await generateShadowWork(userData, shadowJournal);
      if (res.success) {
          setUserData({ ...userData, shadowWork: res.data });
          await saveProgress({ shadowWork: res.data });
          setShadowJournal('');
      }
      setLoading(false);
  };

  const saveProgress = async (newData: any) => {
      const uid = auth?.currentUser?.uid || JSON.parse(localStorage.getItem('eunoia_user') || '{}').uid;
      if (uid) await saveUserProgress(uid, newData);
  };

  const handleGenerateAura = async () => {
      if (!userData.synthesis || userData.auraImage) return;
      setLoading(true);
      setLoadingMessage('Painting your Soul Aura');
      const context = `${userData.archetype?.title}, ${userData.temperament?.title}, ${userData.synthesis?.mantra}`;
      const res = await generateSoulAura(context);
      if (res.success) {
          setUserData({ ...userData, auraImage: res.data });
          await saveProgress({ auraImage: res.data });
      }
      setLoading(false);
  };

  const handleDailyReview = async () => {
    if (!reviewReport.trim()) return;
    setLoading(true);
    setLoadingMessage('Logging evolution');
    const res = await analyzeDailyGrowth(userData, dailyBlueprint, reviewReport, energyLevel);
    if (res.success && res.data) {
        const todayStr = new Date().toISOString().split('T')[0];
        const updates = { streakCount: (userData.streakCount || 0) + 1, lastReflectionDate: todayStr, dailyLogs: [{ date: todayStr, growthSummary: res.data.growthSummary, achievementScore: res.data.achievementScore }, ...(userData.dailyLogs || [])].slice(0, 30) };
        setUserData({ ...userData, ...updates });
        await saveProgress(updates);
        setShowReviewForm(false);
        setReviewReport('');
    }
    setLoading(false);
  };

  const currentStep = useMemo(() => {
    if (!userData.archetype) return 'personality';
    if (!userData.temperament) return 'temperament';
    if (!userData.ikigai) return 'ikigai';
    if (!userData.synthesis) return 'synthesis';
    return 'complete';
  }, [userData]);

  const renderActiveModule = () => {
      if (loading) return <DynamicLoader text={loadingMessage} />;
      switch(activeModule) {
          case 'personality':
              return !userData.archetype ? 
                <QuizView title="Archetype" questions={PERSONALITY_QUESTIONS} onComplete={(a:any) => { setLoading(true); analyzePersonality(a.join('; '), '').then(r => r.success && (setUserData({...userData, archetype: r.data}), saveProgress({archetype: r.data}))).finally(() => setLoading(false)); }} color="purple" icon={<Fingerprint className="text-purple-500"/>} /> : 
                <ComprehensiveResultView title="Archetype" data={userData.archetype} color="purple" onNext={() => setActiveModule('temperament')} onReset={() => saveProgress({archetype: null}).then(() => setUserData({...userData, archetype: null}))} />;
          case 'temperament':
              return !userData.temperament ? 
                <QuizView title="Energy" questions={TEMPERAMENT_QUESTIONS} onComplete={(a:any) => { setLoading(true); analyzeTemperament(a.join('; '), '').then(r => r.success && (setUserData({...userData, temperament: r.data}), saveProgress({temperament: r.data}))).finally(() => setLoading(false)); }} color="cyan" icon={<Activity className="text-cyan-500"/>} /> : 
                <ComprehensiveResultView title="Energy Analysis" data={userData.temperament} color="cyan" onNext={() => setActiveModule('ikigai')} onReset={() => saveProgress({temperament: null}).then(() => setUserData({...userData, temperament: null}))} />;
          case 'ikigai':
              return !userData.ikigai ? 
                <IkigaiForm onSubmit={(l:any,g:any,n:any,p:any) => { setLoading(true); generateIkigaiInsight(l,g,n,p).then(r => r.success && (setUserData({...userData, ikigai: r.data}), saveProgress({ikigai: r.data}))).finally(() => setLoading(false)); }} /> : 
                <ComprehensiveResultView title="Purpose Map" data={userData.ikigai} color="pink" onNext={() => setActiveModule('synthesis')} onReset={() => saveProgress({ikigai: null}).then(() => setUserData({...userData, ikigai: null}))} />;
          case 'synthesis':
              return !userData.synthesis ? 
                <SynthesisForm onSubmit={(f:any) => { setLoading(true); generateLifeSynthesis({...userData, ...f}).then(r => r.success && (setUserData({...userData, ...f, synthesis: r.data}), saveProgress({...f, synthesis: r.data}))).finally(() => setLoading(false)); }} data={userData} /> : 
                <ComprehensiveResultView title="Master Strategy" data={userData.synthesis} color="indigo" onNext={() => setActiveModule(null)} onReset={() => saveProgress({synthesis: null}).then(() => setUserData({...userData, synthesis: null}))} />;
          case 'mirror': return <MirrorChamberView profile={userData} onBack={() => setActiveModule(null)} />;
          case 'shadow': return (
              <div className="space-y-8 animate-fade-in py-10">
                  <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto"><Ghost className="w-10 h-10 text-slate-400"/></div>
                      <h2 className="text-3xl font-bold dark:text-white">Shadow Ritual</h2>
                      <p className="text-sm text-gray-500 italic max-w-sm mx-auto">"What did you feel today that you tried to hide? Speak it here to integrate it."</p>
                  </div>
                  <textarea 
                    value={shadowJournal} 
                    onChange={e => setShadowJournal(e.target.value)} 
                    placeholder="Today I felt frustrated when..." 
                    className="w-full h-32 p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl outline-none text-sm dark:text-white"
                  />
                  <button onClick={handleShadowRitual} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl">Integrate Shadow</button>
                  {userData.shadowWork && <ComprehensiveResultView title="Shadow Integration" data={userData.shadowWork} color="slate" onNext={() => setActiveModule(null)} onReset={() => setUserData({...userData, shadowWork: null})} />}
              </div>
          );
          case 'identity': return <IdentityView data={userData} onGenerate={() => { setLoading(true); generateNickname(userData.archetype?.title || 'Seeker').then(n => { setUserData({...userData, nickname: n}); saveProgress({nickname: n}); }).finally(() => setLoading(false)); }} onBack={() => setActiveModule(null)} />;
          default: return null;
      }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 transition-colors duration-1000 ${mood === 'energized' ? 'bg-orange-50 dark:bg-orange-950/10' : mood === 'reflective' ? 'bg-indigo-50 dark:bg-indigo-950/10' : 'bg-slate-50 dark:bg-black'}`}>
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="space-y-8 animate-fade-in">
                {/* Mood Tracker Header */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-white/5 p-4 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm gap-4">
                    <div className="flex items-center gap-2">
                        <SparkleIcon className="w-5 h-5 text-purple-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Ritual Tone</span>
                    </div>
                    <div className="flex gap-4">
                        <MoodBtn active={mood === 'calm'} onClick={() => setMood('calm')} icon={<Meh />} label="Calm" color="slate" />
                        <MoodBtn active={mood === 'energized'} onClick={() => setMood('energized')} icon={<Smile />} label="Energized" color="orange" />
                        <MoodBtn active={mood === 'reflective'} onClick={() => setMood('reflective')} icon={<Frown />} label="Reflective" color="indigo" />
                    </div>
                </div>

                {/* Aura & Identity Card */}
                {userData.synthesis && (
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
                        {userData.auraImage ? (
                            <div className="w-full md:w-64 aspect-square rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                <img src={userData.auraImage} className="w-full h-full object-cover animate-pulse-slow" alt="Soul Aura" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Your Soul Aura</span>
                                </div>
                            </div>
                        ) : (
                            <button onClick={handleGenerateAura} className="w-full md:w-64 aspect-square bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-purple-500 transition-all text-gray-400">
                                <SparkleIcon className="w-10 h-10" />
                                <span className="text-xs font-bold uppercase">Generate Aura</span>
                            </button>
                        )}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl font-serif font-bold dark:text-white mb-2">{userData.nickname || userData.name}</h2>
                            <p className="text-purple-600 dark:text-purple-400 text-lg italic mb-6">"{userData.synthesis.mantra}"</p>
                            
                            {dailyAffirmationText && (
                                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex items-center justify-between group">
                                    <p className="text-sm font-medium italic">"{dailyAffirmationText}"</p>
                                    <button onClick={handlePlayAffirmation} className={`p-2 rounded-full ${isPlayingAudio ? 'bg-purple-600 text-white animate-pulse' : 'bg-white dark:bg-white/10 text-purple-600 hover:scale-110 transition-all shadow-md'}`}>
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <button onClick={() => navigate('/profile')} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
                                    <User className="w-4 h-4" /> View Soul Archive
                                </button>
                                <button onClick={() => setActiveModule('shadow')} className="px-6 py-2 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm dark:text-white flex items-center gap-2">
                                    <Ghost className="w-4 h-4" /> Shadow Work
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {currentStep !== 'complete' ? (
                            <div onClick={() => setActiveModule(currentStep)} className="cursor-pointer bg-purple-600 p-10 rounded-[2.5rem] text-white shadow-2xl hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Sanctuary Path</span>
                                    <h3 className="text-3xl font-bold">Step {currentStep === 'personality' ? '1' : currentStep === 'temperament' ? '2' : '3'}: {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}</h3>
                                    <p className="opacity-80">Unlock this module to build your master life strategy.</p>
                                </div>
                                <ArrowIcon className="w-12 h-12 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 flex justify-between items-center shadow-lg">
                                <div>
                                    <h3 className="text-xl font-bold dark:text-white">Daily Sanctuary</h3>
                                    <p className="text-gray-500 text-sm">Your strategy is live. Reflect, grow, repeat.</p>
                                </div>
                                <button onClick={() => setActiveModule('mirror')} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:rotate-6 transition-all">
                                    <MessageCircle className="w-6 h-6" />
                                </button>
                            </div>
                        )}

                        {userData.archetype && (
                             <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
                                    <h2 className="font-bold text-lg dark:text-white">Growth Tasks</h2>
                                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs font-bold text-purple-600">
                                        {showReviewForm ? "Tasks" : "Review Day"}
                                    </button>
                                </div>
                                <div className="p-8">
                                    {showReviewForm ? (
                                        <div className="space-y-4">
                                             <textarea value={reviewReport} onChange={e => setReviewReport(e.target.value)} placeholder="What was your main insight today?" className="w-full h-24 p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm dark:text-white" />
                                             <button onClick={handleDailyReview} disabled={!reviewReport.trim()} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold">Log Evolution</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            <BlueprintTask icon={<Coffee />} title="AM" task={dailyBlueprint?.morning.task} color="orange" />
                                            <BlueprintTask icon={<Sun />} title="DAY" task={dailyBlueprint?.afternoon.task} color="yellow" />
                                            <BlueprintTask icon={<Moon />} title="PM" task={dailyBlueprint?.evening.task} color="indigo" />
                                        </div>
                                    )}
                                </div>
                             </div>
                        )}
                    </div>
                    
                    <div className="lg:col-span-4 bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 flex flex-col h-[500px]">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">Activity Archive</h3>
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                            {userData.dailyLogs?.length > 0 ? (
                                userData.dailyLogs.map((log: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
                                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                            <span>{log.date}</span>
                                            <span className="text-green-500 font-bold">{log.achievementScore}%</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{log.growthSummary}"</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-20">No history yet.</p>
                            )}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                           <p className="text-[10px] text-gray-400 italic">"The path is long, but every step is a victory."</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {activeModule && (
            <div className="animate-fade-in max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                <button onClick={() => setActiveModule(null)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-white/10 rounded-full"><X className="w-5 h-5 dark:text-white" /></button>
                {renderActiveModule()}
            </div>
        )}
      </div>
    </div>
  );
};

const MoodBtn = ({ active, onClick, icon, label, color }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${active ? `bg-${color}-500 text-white shadow-lg scale-105` : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
        {icon} {label}
    </button>
);

const MirrorChamberView = ({ profile, onBack }: any) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const msg = input; setInput('');
        setMessages(p => [...p, { role: 'user', content: msg }]);
        setLoading(true);
        const res = await consultTheMirror(msg, profile);
        if (res.success && res.data) setMessages(p => [...p, { role: 'ai', reflection: res.data.reflection, question: res.data.question }]);
        setLoading(false);
    };
    return (
        <div className="flex flex-col h-[500px]">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold dark:text-white">Reflection Mirror</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Talk to the depths of your psyche</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                        <Eye className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-sm">Speak. Your guide is listening.</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-white/5 dark:text-gray-300 rounded-tl-none border border-gray-200 dark:border-white/10 shadow-sm'}`}>
                            {m.role === 'user' ? m.content : (
                                <div className="space-y-2">
                                    <p className="italic text-gray-500">"{m.reflection}"</p>
                                    <p className="font-bold">{m.question}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">Disclaimer: This guide uses AI reflection and is not a substitute for professional therapy or medical advice.</p>
            </div>
            <div className="relative">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="What's weighing on your heart?" className="w-full p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm dark:text-white" />
                <button onClick={handleSend} className="absolute right-3 top-3 p-1.5 bg-purple-600 text-white rounded-lg shadow-lg"><Send className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

const BlueprintTask = ({ icon, title, task, color }: any) => (
    <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-center flex flex-col items-center hover:scale-105 transition-transform">
        <div className={`w-8 h-8 rounded-full bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-2`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        <h4 className="text-[10px] font-bold dark:text-gray-200 mt-1">{task || "TBD"}</h4>
    </div>
);

const QuizView = ({ questions, onComplete, color, icon }: any) => {
    const [idx, setIdx] = useState(0);
    const [ans, setAns] = useState<string[]>([]);
    const sel = (o: string) => { const n = [...ans, o]; setAns(n); if (idx < questions.length - 1) setIdx(idx + 1); else onComplete(n); };
    return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto py-10">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>Phase {idx+1} / {questions.length}</span>
                <span>{Math.round(((idx+1)/questions.length)*100)}%</span>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all`} style={{width: `${((idx+1)/questions.length)*100}%`}}></div>
            </div>
            <h4 className="text-xl font-bold dark:text-white leading-snug">{questions[idx].text}</h4>
            <div className="grid gap-3">
                {questions[idx].options.map((o:string) => (
                    <button key={o} onClick={() => sel(o)} className="p-5 text-left border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-white/5 hover:border-purple-500 hover:shadow-xl transition-all text-sm font-medium dark:text-white">{o}</button>
                ))}
            </div>
        </div>
    );
};

const ComprehensiveResultView = ({ title, data, color, onNext, onReset }: any) => {
    const [showFullAnalysis, setShowFullAnalysis] = useState(false);
    return (
        <div className="space-y-8 animate-fade-in text-center py-6">
            <div className="space-y-2">
                <span className={`px-4 py-1 bg-${color}-500/10 text-${color}-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-${color}-500/20`}>{title}</span>
                <h3 className="text-4xl md:text-5xl font-bold dark:text-white">{data.title || data.archetype || data.temperament}</h3>
                <p className="text-gray-500 italic text-lg">"{data.tagline || data.mantra || 'A unique journey'}"</p>
            </div>
            {data.summary && <div className="p-8 bg-purple-600 text-white rounded-[2rem] shadow-xl text-xl font-medium italic">"{data.summary}"</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-4">Core Strengths</h4>
                    <ul className="space-y-2">{data.strengths?.map((s:string) => (<li key={s} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-emerald-500 mt-1 font-bold">•</span> {s}</li>))}</ul>
                </div>
                <div className="p-6 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-orange-600 uppercase mb-4">Growth Areas</h4>
                    <ul className="space-y-2">{(data.weaknesses || data.shadowTraits || data.shadowSide)?.map((s:string) => (<li key={s} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-orange-500 mt-1 font-bold">•</span> {s}</li>))}</ul>
                </div>
            </div>
            <div className="space-y-4">
                <button onClick={() => setShowFullAnalysis(!showFullAnalysis)} className="flex items-center gap-2 mx-auto text-xs font-bold uppercase text-purple-600">{showFullAnalysis ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>} Deep Dive Analysis</button>
                {showFullAnalysis && <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] text-sm text-left dark:text-gray-300 border border-gray-200 dark:border-white/10 italic leading-relaxed">{data.description || data.insight}</div>}
            </div>
            <div className="p-10 bg-slate-900 text-white rounded-[2.5rem] text-left border border-white/10 shadow-2xl overflow-hidden relative">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-6 flex items-center gap-2"><Map className="w-4 h-4" /> The Way Ahead</h4>
                <div className="space-y-4">
                    {Array.isArray(data.wayForward) ? data.wayForward.map((step: any, i: number) => (
                        <div key={i} className="flex gap-4 items-start"><div className="w-6 h-6 rounded-full bg-purple-500 border border-purple-500 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div><p className="text-base">{step}</p></div>
                    )) : <p className="text-base">{data.wayForward}</p>}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-10">
                <button onClick={onNext} className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">Proceed to Next Step</button>
                <button onClick={onReset} className="px-10 py-5 border border-gray-200 dark:border-white/10 rounded-2xl font-bold text-gray-400 hover:text-red-500 transition-all">Restart Module</button>
            </div>
        </div>
    );
};

const PERSONALITY_QUESTIONS = [
    { id: 1, text: "In a moment of sudden crisis, you are:", options: ["The one taking charge immediately", "The one noticing how everyone feels", "The one analyzing the logic of the situation", "The one searching for creative workarounds"] },
    { id: 2, text: "A truly successful life for you means:", options: ["Maximum impact and legacy", "Maximum freedom and adventure", "Maximum wisdom and understanding", "Maximum peace and connection"] },
    { id: 3, text: "When you look at a blank canvas, you feel:", options: ["Excitement for the potential", "Anxiety for the lack of structure", "A need to plan before acting", "Ready to just start and see what happens"] }
];

const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "Your natural baseline state is:", options: ["Restless and intense", "Calm and steady", "Light and social", "Deep and private"] },
    { id: 2, text: "After a conflict, your energy:", options: ["Stays high and angry", "Drops significantly and needs sleep", "Bounces back quickly with a joke", "Lingers as quiet reflection"] }
];

const IkigaiForm = ({ onSubmit }: any) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ l:'', g:'', n:'', p:'' });
    const steps = [
        { key: 'l', title: 'What you LOVE', examples: ['Art', 'Logic', 'Compassion'] },
        { key: 'g', title: 'What you are GOOD AT', examples: ['Strategy', 'Listening', 'Creation'] },
        { key: 'n', title: 'What the WORLD NEEDS', examples: ['Healing', 'Technology', 'Justice'] },
        { key: 'p', title: 'What you can be PAID FOR', examples: ['Leadership', 'Instruction', 'Service'] }
    ];
    const current = steps[step - 1];
    const next = () => { if (step < 4) setStep(step + 1); else onSubmit(f.l, f.g, f.n, f.p); };
    return (
        <div className="space-y-6 animate-fade-in max-w-lg mx-auto py-10">
            <div className="flex gap-2 justify-center mb-8">{[1,2,3,4].map(s => (<div key={s} className={`w-12 h-1 rounded-full ${step >= s ? 'bg-pink-500' : 'bg-gray-100 dark:bg-white/10'}`}></div>))}</div>
            <div className="text-center mb-10"><h3 className="text-3xl font-bold dark:text-white">{current.title}</h3></div>
            <textarea value={f[current.key as keyof typeof f]} onChange={e => setF({...f, [current.key]: e.target.value})} placeholder="Write keywords or short sentences..." className="w-full p-6 border border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-black/30 text-xl h-44 outline-none focus:ring-2 ring-pink-500 dark:text-white shadow-inner" />
            <div className="flex gap-4 pt-10">{step > 1 && (<button onClick={() => setStep(step - 1)} className="px-8 py-5 bg-gray-100 dark:bg-white/10 rounded-2xl font-bold dark:text-white">Back</button>)}
                <button onClick={next} disabled={!f[current.key as keyof typeof f].trim()} className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl disabled:opacity-50">Next Phase</button>
            </div>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, data }: any) => {
    const [f, setF] = useState({ age: data.age || '', principles: data.principles || '', likes: data.likes || '', dislikes: data.dislikes || '' });
    return (
        <div className="space-y-8 max-w-md mx-auto py-10">
            <div className="text-center mb-6"><h3 className="text-3xl font-bold dark:text-white">The Synthesis</h3><p className="text-gray-500 mt-2">Merging your data into a strategy.</p></div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Current Age</label>
                <input value={f.age} onChange={e => setF({...f, age:e.target.value})} placeholder="24" className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white" />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Main Life Principle</label>
                <textarea value={f.principles} onChange={e => setF({...f, principles:e.target.value})} placeholder="What is your non-negotiable value?" className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white h-24" />
            </div>
            <button onClick={() => onSubmit(f)} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-bold shadow-xl hover:bg-purple-700 transition-all">Forge My Strategy</button>
        </div>
    );
};

const IdentityView = ({ data, onGenerate, onBack }: any) => (
    <div className="flex flex-col items-center gap-10 py-10 animate-fade-in max-w-sm mx-auto">
        {!data.nickname ? (
            <div className="text-center space-y-8">
                <div className="w-24 h-24 bg-amber-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-amber-100 dark:border-white/10"><Shield className="w-10 h-10 text-amber-400"/></div>
                <h3 className="text-3xl font-bold dark:text-white">Forging Name</h3>
                <p className="text-sm text-gray-500">Allow the Oracle to distill your essence into a title.</p>
                <button onClick={onGenerate} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl">Obtain Identity</button>
            </div>
        ) : (
            <div className="bg-white dark:bg-white/10 p-12 rounded-[3rem] text-center shadow-2xl border border-gray-200 dark:border-white/10 w-full relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-bold">{(data.nickname || 'S')[0]}</div>
                <h4 className="text-3xl font-bold dark:text-white">{data.nickname}</h4>
                <p className="text-[10px] uppercase tracking-[0.4em] text-purple-600 font-bold mt-4">{data.archetype?.title || 'Seeker'}</p>
            </div>
        )}
        <button onClick={onBack} className="text-xs text-gray-400 hover:underline">Return to Hub</button>
    </div>
);

export default DashboardPage;
