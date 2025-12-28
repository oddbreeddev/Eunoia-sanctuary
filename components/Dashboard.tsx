
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, 
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus, Ghost, Eye, Send, RotateCcw, Sunrise, Sunset, Coffee, ListChecks,
  Globe, Handshake, HeartOff, Landmark, History, Bell, BellOff, Info, Sparkle, HelpCircle, Lightbulb as IdeaIcon, Copy, RefreshCw,
  Twitter, Share, Plus, Trash, ChevronDown, ChevronUp, Sparkle as SparkleIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight, consultTheMirror, generateShadowWork, generateDailyBlueprint, analyzeDailyGrowth, generateDailyAffirmation } from '../services/geminiService';
import { saveUserProgress, getUserProfile, DailyLog, DailyGoal } from '../services/adminService';

const MODULES = [
  { id: 'personality', title: 'Personality Type', key: 'archetype', desc: 'Step 1: Core Traits', icon: Fingerprint, color: 'purple', requiredFor: null },
  { id: 'temperament', title: 'Energy Style', key: 'temperament', desc: 'Step 2: Natural Rhythms', icon: Activity, color: 'cyan', requiredFor: 'personality' },
  { id: 'ikigai', title: 'Purpose Map', key: 'ikigai', desc: 'Step 3: Goals & Career', icon: Compass, color: 'pink', requiredFor: 'temperament' },
  { id: 'synthesis', title: 'Action Plan', key: 'synthesis', desc: 'Step 4: Full Strategy', icon: Zap, color: 'indigo', requiredFor: 'ikigai' },
  { id: 'mirror', title: 'Reflect', key: 'archetype', desc: 'Daily Self-Check', icon: Eye, color: 'blue', requiredFor: 'personality' },
  { id: 'shadow', title: 'Blind Spots', key: 'shadowWork', desc: 'Growth Areas', icon: Ghost, color: 'slate', requiredFor: 'synthesis' },
  { id: 'identity', title: 'Profile Name', key: 'nickname', desc: 'Personal Nickname', icon: Star, color: 'amber', requiredFor: 'personality' }
];

const OnboardingGuide = ({ onStart }: { onStart: () => void }) => {
  const [step, setStep] = useState(0);
  const slides = [
    {
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
      title: "Welcome to the Sanctuary",
      description: "Eunoia is a laboratory for your soul. Here, we blend depth psychology with AI to help you map your internal universe.",
      tip: "Find a quiet space. Reflection requires stillness."
    },
    {
      icon: <Target className="w-12 h-12 text-cyan-500" />,
      title: "The Four-Step Path",
      description: "You'll progress through Personality, Temperament, and Ikigai to build your Master Life Strategy. Each step unlocks the next.",
      tip: "Be brutally honest. There are no 'wrong' answers here, only truths."
    },
    {
      icon: <Zap className="w-12 h-12 text-amber-500" />,
      title: "Daily Evolution",
      description: "Once your profile is set, your dashboard provides daily blueprints, affirmations, and a 'Mirror Chamber' for nightly reflection.",
      tip: "Small daily insights lead to massive life shifts."
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-14 border border-gray-200 dark:border-white/10 shadow-2xl relative text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-cyan-500 to-amber-500"></div>
        <div className="relative z-10 animate-fade-in" key={step}>
          <div className="flex justify-center mb-8 transform scale-125">
            {slides[step].icon}
          </div>
          <h2 className="text-3xl font-bold dark:text-white mb-4">{slides[step].title}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-10 text-lg">
            {slides[step].description}
          </p>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 mb-10 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-3 justify-center">
            <Info className="w-4 h-4 text-purple-500" /> Pro Tip: {slides[step].tip}
          </div>
          <div className="flex gap-4">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 border border-gray-200 dark:border-white/10 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Back
              </button>
            )}
            <button 
              onClick={() => step < slides.length - 1 ? setStep(step + 1) : onStart()}
              className="flex-[2] py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {step === slides.length - 1 ? 'Enter Sanctuary' : 'Continue'} <ArrowIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-purple-500 w-6' : 'bg-gray-200 dark:bg-white/10'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Connecting to your AI Guide</p>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Results');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState<any>({
    name: 'User',
    archetype: null, temperament: null, ikigai: null, synthesis: null,
    age: '', principles: '', nickname: '', shadowWork: null,
    likes: '', dislikes: '', region: '', religion: '',
    streakCount: 0, dailyLogs: [], dailyGoals: [], lastReflectionDate: null
  });
  const [dailyBlueprint, setDailyBlueprint] = useState<any>(null);
  const [dailyAffirmationText, setDailyAffirmationText] = useState<string | null>(null);
  const [refreshingAffirmation, setRefreshingAffirmation] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewReport, setReviewReport] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const bgStyles = useMemo(() => {
    return 'from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-black dark:to-slate-900';
  }, []);

  const currentStep = useMemo(() => {
    if (!userData.archetype) return 'personality';
    if (!userData.temperament) return 'temperament';
    if (!userData.ikigai) return 'ikigai';
    if (!userData.synthesis) return 'synthesis';
    return 'complete';
  }, [userData]);

  const nextModule = useMemo(() => MODULES.find(m => m.id === currentStep), [currentStep]);

  useEffect(() => {
    let unsubscribe: any;
    const initData = async (uid: string) => {
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                setUserData(prev => ({ ...prev, ...profile }));
                const onboardingSeen = localStorage.getItem(`onboarding_seen_${uid}`);
                if (!profile.archetype && !onboardingSeen) {
                  setShowOnboarding(true);
                }
                if (profile.archetype || profile.temperament) {
                    const blueprintRes = await generateDailyBlueprint(profile);
                    if (blueprintRes.success) setDailyBlueprint(blueprintRes.data);
                    const affirmationRes = await generateDailyAffirmation(profile);
                    if (affirmationRes.success) setDailyAffirmationText(affirmationRes.data.affirmation);
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
  }, [navigate]);

  const handleFinishOnboarding = () => {
    setShowOnboarding(false);
    const uid = auth?.currentUser?.uid || JSON.parse(localStorage.getItem('eunoia_user') || '{}').uid;
    if (uid) localStorage.setItem(`onboarding_seen_${uid}`, 'true');
  };

  const handleRefreshAffirmation = async () => {
    setRefreshingAffirmation(true);
    const res = await generateDailyAffirmation(userData);
    if (res.success) setDailyAffirmationText(res.data.affirmation);
    setRefreshingAffirmation(false);
  };

  const handleShareAffirmation = async () => {
    if (!dailyAffirmationText) return;
    const shareText = `✨ My daily affirmation from Eunoia: "${dailyAffirmationText}" \n\nDiscover your path at Eunoia.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Daily Inspiration', text: shareText, url: window.location.origin });
      } catch (err) { console.error("Error sharing:", err); }
    } else {
      setShowShareModal(true);
    }
  };

  const saveProgress = async (newData: any) => {
      const uid = auth?.currentUser?.uid || JSON.parse(localStorage.getItem('eunoia_user') || '{}').uid;
      if (uid) await saveUserProgress(uid, newData);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal: DailyGoal = { id: Date.now().toString(), text: newGoalText.trim(), completed: false, createdAt: new Date().toISOString() };
    const updatedGoals = [...(userData.dailyGoals || []), newGoal];
    setUserData({ ...userData, dailyGoals: updatedGoals });
    setNewGoalText('');
    await saveProgress({ dailyGoals: updatedGoals });
  };

  const toggleGoal = async (id: string) => {
    const updatedGoals = userData.dailyGoals.map((g: DailyGoal) => g.id === id ? { ...g, completed: !g.completed } : g);
    setUserData({ ...userData, dailyGoals: updatedGoals });
    await saveProgress({ dailyGoals: updatedGoals });
  };

  const deleteGoal = async (id: string) => {
    const updatedGoals = userData.dailyGoals.filter((g: DailyGoal) => g.id !== id);
    setUserData({ ...userData, dailyGoals: updatedGoals });
    await saveProgress({ dailyGoals: updatedGoals });
  };

  const handleDailyReview = async () => {
    if (!reviewReport.trim()) return;
    setLoading(true);
    setLoadingMessage('Processing progress');
    const res = await analyzeDailyGrowth(userData, dailyBlueprint, reviewReport, energyLevel);
    if (res.success && res.data) {
        const todayStr = new Date().toISOString().split('T')[0];
        const isNewDay = userData.lastReflectionDate !== todayStr;
        const newStreak = isNewDay ? (userData.streakCount || 0) + 1 : (userData.streakCount || 0);
        const newLog: DailyLog = { date: todayStr, blueprintTheme: dailyBlueprint.theme, userReport: reviewReport, growthSummary: res.data.growthSummary, achievementScore: res.data.achievementScore };
        const updatedLogs = [newLog, ...(userData.dailyLogs || [])].slice(0, 30);
        const updates = { streakCount: newStreak, lastReflectionDate: todayStr, dailyLogs: updatedLogs };
        setUserData({ ...userData, ...updates });
        await saveProgress(updates);
        setShowReviewForm(false);
        setReviewReport('');
    }
    setLoading(false);
  };

  const handleBackToHub = () => { setActiveModule(null); setError(null); setLoading(false); };

  const handleProceedToNext = () => {
      if (currentStep !== 'complete') setActiveModule(currentStep);
      else setActiveModule(null);
  };

  const renderActiveModule = () => {
      if (loading) return <DynamicLoader text={loadingMessage} />;
      const nextStageName = nextModule?.title || "Dashboard";
      switch(activeModule) {
          case 'personality':
              return !userData.archetype ? 
                <QuizView title="Personality Archetype" questions={PERSONALITY_QUESTIONS} onComplete={(a:any) => { setLoading(true); analyzePersonality(a.join('; '), '').then(r => r.success && (setUserData({...userData, archetype: r.data}), saveProgress({archetype: r.data}))).finally(() => setLoading(false)); }} color="purple" icon={<Fingerprint className="text-purple-500"/>} /> : 
                <ComprehensiveResultView title="Personality Result" data={userData.archetype} color="purple" nextStageLabel={nextStageName} onNext={handleProceedToNext} onReset={() => saveProgress({archetype: null}).then(() => setUserData({...userData, archetype: null}))} />;
          case 'temperament':
              return !userData.temperament ? 
                <QuizView title="Energy Style" questions={TEMPERAMENT_QUESTIONS} onComplete={(a:any) => { setLoading(true); analyzeTemperament(a.join('; '), '').then(r => r.success && (setUserData({...userData, temperament: r.data}), saveProgress({temperament: r.data}))).finally(() => setLoading(false)); }} color="cyan" icon={<Activity className="text-cyan-500"/>} /> : 
                <ComprehensiveResultView title="Energy Analysis" data={userData.temperament} color="cyan" nextStageLabel={nextStageName} onNext={handleProceedToNext} onReset={() => saveProgress({temperament: null}).then(() => setUserData({...userData, temperament: null}))} />;
          case 'ikigai':
              return !userData.ikigai ? 
                <IkigaiForm onSubmit={(l:any,g:any,n:any,p:any) => { setLoading(true); generateIkigaiInsight(l,g,n,p).then(r => r.success && (setUserData({...userData, ikigai: r.data}), saveProgress({ikigai: r.data}))).finally(() => setLoading(false)); }} /> : 
                <ComprehensiveResultView title="Purpose Map" data={userData.ikigai} color="pink" nextStageLabel={nextStageName} onNext={handleProceedToNext} onReset={() => saveProgress({ikigai: null}).then(() => setUserData({...userData, ikigai: null}))} />;
          case 'synthesis':
              return !userData.synthesis ? 
                <SynthesisForm onSubmit={(f:any) => { setLoading(true); generateLifeSynthesis({...userData, ...f}).then(r => r.success && (setUserData({...userData, ...f, synthesis: r.data}), saveProgress({...f, synthesis: r.data}))).finally(() => setLoading(false)); }} data={userData} /> : 
                <ComprehensiveResultView title="Master Life Strategy" data={userData.synthesis} color="indigo" nextStageLabel="Finalize Journey" onNext={handleProceedToNext} onReset={() => saveProgress({synthesis: null}).then(() => setUserData({...userData, synthesis: null}))} />;
          case 'mirror': return <MirrorChamberView profile={userData} onBack={handleBackToHub} />;
          case 'shadow': return !userData.shadowWork ? <ShadowReadinessView onGenerate={() => { setLoading(true); generateShadowWork(userData).then(res => res.success && setUserData({...userData, shadowWork: res.data})).finally(() => setLoading(false)); }} /> : <ComprehensiveResultView title="Shadow Discovery" data={userData.shadowWork} color="slate" onNext={handleBackToHub} onReset={() => saveProgress({shadowWork: null}).then(() => setUserData({...userData, shadowWork: null}))} />;
          case 'identity': return <IdentityView data={userData} onGenerate={() => { setLoading(true); generateNickname(userData.archetype?.archetype || 'Seeker').then(n => setUserData({...userData, nickname: n})).finally(() => setLoading(false)); }} onBack={handleBackToHub} />;
          default: return null;
      }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-1000 bg-gradient-to-br ${bgStyles}`}>
      {showOnboarding && <OnboardingGuide onStart={handleFinishOnboarding} />}
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="mb-8 space-y-10 animate-fade-in">
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-1 dark:text-white">Growth Hub</h1>
                        <p className="text-gray-500 text-sm">Hello {userData.nickname || userData.name}, welcome back.</p>
                    </div>
                    <div className="flex-1 max-w-lg w-full">
                        <div className="flex justify-between relative">
                            <div className="absolute top-4 left-0 w-full h-px bg-gray-200 dark:bg-white/10 -z-10"></div>
                            {['personality', 'temperament', 'ikigai', 'synthesis'].map((step, idx) => {
                                const mod = MODULES.find(m => m.id === step);
                                const isDone = !!userData[mod?.key || ''];
                                const isCurrent = currentStep === step;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-green-500 border-green-500 text-white' : isCurrent ? 'bg-purple-600 border-purple-600 text-white animate-pulse' : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-400'}`}>
                                            {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {dailyAffirmationText && (
                  <div className="relative group overflow-hidden rounded-[2.5rem] border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-cyan-950/20 p-10 md:p-14 shadow-2xl text-center">
                    <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-purple-200 dark:border-purple-800">
                        <Quote className="w-3.5 h-3.5" /> Inspiration
                      </div>
                      <h2 className="text-2xl md:text-4xl font-serif font-bold dark:text-white leading-[1.2] mb-10 italic">"{dailyAffirmationText}"</h2>
                      <div className="flex gap-4">
                        <button onClick={handleShareAffirmation} className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:text-indigo-600 shadow-sm transition-all"><Share2 className="w-6 h-6" /></button>
                        <button onClick={handleRefreshAffirmation} disabled={refreshingAffirmation} className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:text-cyan-600 shadow-sm transition-all"><RefreshCw className={`w-6 h-6 ${refreshingAffirmation ? 'animate-spin' : ''}`} /></button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep !== 'complete' && (
                    <div onClick={() => setActiveModule(currentStep)} className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-xl hover:border-purple-500/50 transition-all">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl bg-${nextModule?.color}-500/10 text-${nextModule?.color}-500 flex items-center justify-center shrink-0`}>
                                {nextModule && <nextModule.icon className="w-8 h-8" />}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-xl font-bold dark:text-white">Next Step: {nextModule?.title}</h2>
                                <p className="text-gray-500 text-sm">Unlock the next level of your strategy.</p>
                            </div>
                            <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">Start Now</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {userData.archetype && (
                             <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
                                    <h2 className="font-bold text-lg dark:text-white">Daily Focus</h2>
                                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                        {showReviewForm ? "Tasks" : "Log Progress"}
                                    </button>
                                </div>
                                <div className="p-8">
                                    {showReviewForm ? (
                                        <div className="space-y-4">
                                             <textarea value={reviewReport} onChange={e => setReviewReport(e.target.value)} placeholder="How was today?" className="w-full h-24 p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm" />
                                             <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    {[1,2,3,4,5].map(v => (
                                                        <button key={v} onClick={() => setEnergyLevel(v)} className={`w-8 h-8 rounded-full text-xs font-bold ${energyLevel === v ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-white/5 text-gray-500'}`}>{v}</button>
                                                    ))}
                                                </div>
                                                <button onClick={handleDailyReview} disabled={!reviewReport.trim()} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm">Save</button>
                                             </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-4">
                                            <BlueprintTask icon={<Coffee />} title="AM" task={dailyBlueprint?.morning.task} color="orange" />
                                            <BlueprintTask icon={<Sun />} title="Day" task={dailyBlueprint?.afternoon.task} color="yellow" />
                                            <BlueprintTask icon={<Moon />} title="PM" task={dailyBlueprint?.evening.task} color="indigo" />
                                        </div>
                                    )}
                                </div>
                             </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MODULES.filter(m => m.id !== currentStep).slice(0, 4).map(m => {
                                const isDone = !!userData[m.key];
                                const isLocked = m.requiredFor ? !userData[MODULES.find(x => x.id === m.requiredFor)?.key || ''] : false;
                                return (
                                    <div key={m.id} onClick={() => !isLocked && setActiveModule(m.id)} className={`p-5 rounded-2xl border flex items-center gap-4 group cursor-pointer ${isLocked ? 'opacity-40 grayscale bg-gray-100/50 dark:bg-white/5' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:shadow-md'}`}>
                                        <div className={`p-3 rounded-xl ${isLocked ? 'bg-gray-200 dark:bg-white/5 text-gray-400' : `bg-${m.color}-500/10 text-${m.color}-500`}`}>
                                            {isLocked ? <Lock className="w-4 h-4" /> : <m.icon className="w-4 h-4"/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-sm truncate ${isLocked ? 'text-gray-500' : 'dark:text-white'}`}>{m.title}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{isDone ? "Review" : m.desc}</p>
                                        </div>
                                        {isDone && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-200 dark:border-white/10 flex flex-col h-[400px]">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">Progress History</h3>
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                            {userData.dailyLogs?.length > 0 ? (
                                userData.dailyLogs.map((log: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center">
                                        <div className="text-[11px] text-gray-600 dark:text-gray-400">"{log.growthSummary}"</div>
                                        <span className="text-[10px] font-bold text-green-500">{log.achievementScore}%</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-10">No logs yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        {activeModule && (
            <div className="animate-fade-in max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                <button onClick={handleBackToHub} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-white/10 rounded-full transition-all z-50"><X className="w-5 h-5 dark:text-white" /></button>
                <button onClick={handleBackToHub} className="mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-purple-600 uppercase tracking-widest transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
                {renderActiveModule()}
            </div>
        )}
      </div>
    </div>
  );
};

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
        <div className="flex flex-col h-[450px]">
            <div className="text-center mb-6"><h3 className="text-xl font-bold dark:text-white">Reflection</h3></div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-white/5 dark:text-gray-300 rounded-tl-none'}`}>
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
            <div className="relative">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="What's on your mind?" className="w-full p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm dark:text-white" />
                <button onClick={handleSend} className="absolute right-3 top-3 p-1.5 bg-purple-600 text-white rounded-lg"><Send className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

const BlueprintTask = ({ icon, title, task, color }: any) => (
    <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-center flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-2`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        <h4 className="text-[10px] font-bold dark:text-gray-200 mt-1">{task || "Pending..."}</h4>
    </div>
);

const QuizView = ({ questions, onComplete, color, icon }: any) => {
    const [idx, setIdx] = useState(0);
    const [ans, setAns] = useState<string[]>([]);
    const sel = (o: string) => { const n = [...ans, o]; setAns(n); if (idx < questions.length - 1) setIdx(idx + 1); else onComplete(n); };
    return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>{idx+1} / {questions.length}</span>
                <span>{Math.round(((idx+1)/questions.length)*100)}%</span>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all`} style={{width: `${((idx+1)/questions.length)*100}%`}}></div>
            </div>
            <h4 className="text-lg font-bold dark:text-white leading-snug">{questions[idx].text}</h4>
            <div className="grid gap-3">
                {questions[idx].options.map((o:string) => (
                    <button key={o} onClick={() => sel(o)} className="p-4 text-left border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 hover:border-purple-500 transition-all text-sm font-medium dark:text-white">{o}</button>
                ))}
            </div>
        </div>
    );
};

const ComprehensiveResultView = ({ title, data, color, onNext, onReset, nextStageLabel }: any) => {
    const [showFullAnalysis, setShowFullAnalysis] = useState(false);
    return (
        <div className="space-y-8 animate-fade-in text-center">
            <div className="space-y-2">
                <span className={`px-4 py-1 bg-${color}-500/10 text-${color}-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-${color}-500/20`}>{title}</span>
                <h3 className="text-3xl md:text-5xl font-bold dark:text-white">{data.title || data.archetype || data.temperament}</h3>
                <p className="text-gray-500 italic text-lg">"{data.tagline || data.mantra || 'A path of discovery'}"</p>
            </div>
            {data.summary && <div className="p-6 bg-purple-600 text-white rounded-[1.5rem] shadow-lg text-lg font-medium italic animate-pulse-slow">"{data.summary}"</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[1.5rem]">
                    <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">Strengths</h4>
                    <ul className="space-y-2">{data.strengths?.map((s:string) => (<li key={s} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-emerald-500 mt-1 font-bold">•</span> {s}</li>))}</ul>
                </div>
                <div className="p-6 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-[1.5rem]">
                    <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-4">Focus Areas</h4>
                    <ul className="space-y-2">{(data.weaknesses || data.shadowTraits || data.shadowSide)?.map((s:string) => (<li key={s} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-orange-500 mt-1 font-bold">•</span> {s}</li>))}</ul>
                </div>
            </div>
            <div className="space-y-4">
                <button onClick={() => setShowFullAnalysis(!showFullAnalysis)} className="flex items-center gap-2 mx-auto text-xs font-bold uppercase text-purple-600 dark:text-purple-400">{showFullAnalysis ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>} {showFullAnalysis ? 'Hide' : 'Deep Analysis'}</button>
                {showFullAnalysis && <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 shadow-inner text-left">{data.description || data.insight}</div>}
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[2rem] text-left border border-white/10 shadow-xl">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-6 flex items-center gap-2"><Map className="w-4 h-4" /> Next Steps</h4>
                <div className="space-y-4">
                    {Array.isArray(data.wayForward) ? data.wayForward.map((step: any, i: number) => (
                        <div key={i} className="flex gap-4 items-start"><div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div><p className="text-sm">{step}</p></div>
                    )) : <p className="text-sm">{data.wayForward}</p>}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button onClick={onNext} className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-all shadow-xl">Continue to {nextStageLabel || "Next"}</button>
                <button onClick={onReset} className="px-8 py-4 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-400 hover:text-red-500 transition-all">Restart</button>
            </div>
        </div>
    );
};

const PERSONALITY_QUESTIONS = [
    { id: 1, text: "Ideal way to recover after stress?", options: ["Solo adventure", "Creative project", "Deep talk with a friend", "Organizing life"] },
    { id: 2, text: "Focus during a debate?", options: ["Strict logic", "Harmony/Vibe", "Future possibilities", "Real-world proof"] },
    { id: 3, text: "Your natural priority?", options: ["Impact/Legacy", "Understanding depth", "Safety/Comfort", "Joy/Experience"] }
];

const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "Morning energy level?", options: ["High & Focused", "Slow & Calm", "Emotional & Varied", "Steady & Durable"] },
    { id: 2, text: "Reaction to sudden change?", options: ["Frustration/Action", "Retreat/Drain", "Excitement/Challenge", "Adapt/Steady"] }
];

const IkigaiForm = ({ onSubmit }: any) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ l:'', g:'', n:'', p:'' });
    const steps = [
        { key: 'l', title: 'What you LOVE', examples: ['Art', 'Code', 'Helping'] },
        { key: 'g', title: 'What you are GOOD AT', examples: ['Logic', 'Listen', 'Plans'] },
        { key: 'n', title: 'What WORLD NEEDS', examples: ['Mental Health', 'Sustainability'] },
        { key: 'p', title: 'What you get PAID FOR', examples: ['Consulting', 'Building'] }
    ];
    const current = steps[step - 1];
    const next = () => { if (step < 4) setStep(step + 1); else onSubmit(f.l, f.g, f.n, f.p); };
    return (
        <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
            <div className="flex gap-1 justify-center">{[1,2,3,4].map(s => (<div key={s} className={`w-8 h-1 rounded-full ${step >= s ? 'bg-pink-500' : 'bg-gray-200 dark:bg-white/10'}`}></div>))}</div>
            <div className="text-center mb-6"><h3 className="text-2xl font-bold dark:text-white">{current.title}</h3></div>
            <textarea value={f[current.key as keyof typeof f]} onChange={e => setF({...f, [current.key]: e.target.value})} placeholder="Keywords or phrases..." className="w-full p-6 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-black/30 text-lg h-32 outline-none focus:ring-2 ring-pink-500" />
            <div className="flex gap-4 pt-4">{step > 1 && (<button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-gray-100 dark:bg-white/10 rounded-xl font-bold text-sm">Back</button>)}
                <button onClick={next} disabled={!f[current.key as keyof typeof f].trim()} className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg disabled:opacity-50">{step === 4 ? 'Finish' : 'Next'}</button>
            </div>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, data }: any) => {
    const [f, setF] = useState({ age: data.age || '', principles: data.principles || '', likes: data.likes || '', dislikes: data.dislikes || '' });
    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center"><h3 className="text-2xl font-bold dark:text-white">Final Sync</h3></div>
            <input value={f.age} onChange={e => setF({...f, age:e.target.value})} placeholder="Age" className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30" />
            <textarea value={f.principles} onChange={e => setF({...f, principles:e.target.value})} placeholder="Core Principle" className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 h-24" />
            <button onClick={() => onSubmit(f)} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl">Complete Journey</button>
        </div>
    );
};

const ShadowReadinessView = ({ onGenerate }: any) => (
    <div className="text-center py-12 space-y-6 max-w-sm mx-auto">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-slate-200 dark:border-white/10"><Ghost className="w-10 h-10 text-slate-400"/></div>
        <h2 className="text-2xl font-bold dark:text-white">Shadow Discovery</h2>
        <p className="text-sm text-gray-500 italic">Explore your hidden depth.</p>
        <button onClick={onGenerate} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl">Analyze Shadow</button>
    </div>
);

const IdentityView = ({ data, onGenerate, onBack }: any) => (
    <div className="flex flex-col items-center gap-8 py-8 animate-fade-in max-w-sm mx-auto">
        {!data.nickname ? (
            <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-amber-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-amber-100 dark:border-white/10"><Shield className="w-8 h-8 text-amber-400"/></div>
                <h3 className="text-2xl font-bold dark:text-white">Forging Identity</h3>
                <button onClick={onGenerate} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-xl">Generate Name</button>
            </div>
        ) : (
            <div className="bg-white dark:bg-white/10 p-10 rounded-[2.5rem] text-center shadow-2xl border border-gray-200 dark:border-white/10 w-full">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold">{(data.nickname || 'S')[0]}</div>
                <h4 className="text-2xl font-bold dark:text-white">{data.nickname}</h4>
                <p className="text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold mt-2">{data.archetype?.archetype || 'Seeker'}</p>
            </div>
        )}
        <button onClick={onBack} className="text-xs text-gray-400 hover:underline">Return to Hub</button>
    </div>
);

export default DashboardPage;
