
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, 
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus, Ghost, Eye, Send, RotateCcw, Sunrise, Sunset, Coffee, ListChecks,
  Globe, Handshake, HeartOff, Landmark, History, Bell, BellOff, Info, Sparkle, HelpCircle, Lightbulb as IdeaIcon, Copy, RefreshCw,
  Twitter, Share, Plus, Trash, ChevronDown, ChevronUp
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

  const handleRefreshAffirmation = async () => {
    setRefreshingAffirmation(true);
    const res = await generateDailyAffirmation(userData);
    if (res.success) setDailyAffirmationText(res.data.affirmation);
    setRefreshingAffirmation(false);
  };

  const handleShareAffirmation = async () => {
    if (!dailyAffirmationText) return;
    
    const shareText = `✨ My daily affirmation from Eunoia: "${dailyAffirmationText}" \n\nDiscover your path at Eunoia.`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Inspiration',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
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
    const newGoal: DailyGoal = {
        id: Date.now().toString(),
        text: newGoalText.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    const updatedGoals = [...(userData.dailyGoals || []), newGoal];
    setUserData({ ...userData, dailyGoals: updatedGoals });
    setNewGoalText('');
    await saveProgress({ dailyGoals: updatedGoals });
  };

  const toggleGoal = async (id: string) => {
    const updatedGoals = userData.dailyGoals.map((g: DailyGoal) => 
        g.id === id ? { ...g, completed: !g.completed } : g
    );
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
    setLoadingMessage('Processing today\'s progress');
    
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
        await saveProgress(updates);
        setShowReviewForm(false);
        setReviewReport('');
    }
    setLoading(false);
  };

  const handleBackToHub = () => {
      setActiveModule(null);
      setError(null);
      setLoading(false);
  };

  const handleProceedToNext = () => {
      if (currentStep !== 'complete') {
          setActiveModule(currentStep);
      } else {
          setActiveModule(null);
      }
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
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="mb-8 space-y-10 animate-fade-in">
                {/* Dashboard Header */}
                <div className="bg-white/50 dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-1 dark:text-white">Growth Dashboard</h1>
                        <p className="text-gray-500 text-sm">
                            Hello {userData.nickname || userData.name}, welcome back to your center.
                        </p>
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
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-green-500 border-green-500 text-white shadow-md' : isCurrent ? 'bg-purple-600 border-purple-600 text-white animate-pulse' : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-400'}`}>
                                            {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isDone ? 'text-green-500' : isCurrent ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>{step.charAt(0).toUpperCase() + step.slice(1, 3)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Daily Affirmation Card */}
                {dailyAffirmationText && (
                  <div className="relative group overflow-hidden rounded-[2.5rem] border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-purple-950/20 dark:via-gray-900 dark:to-cyan-950/20 p-10 md:p-14 shadow-2xl animate-fade-in transition-all hover:shadow-purple-500/10 text-center">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkle className="w-40 h-40 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-purple-200 dark:border-purple-800">
                        <Quote className="w-3.5 h-3.5" /> Your Daily Affirmation
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif font-bold dark:text-white leading-[1.2] mb-10 italic">
                        "{dailyAffirmationText}"
                      </h2>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`"${dailyAffirmationText}" — Discover your path at Eunoia.`);
                            alert("Inspiration copied to clipboard!");
                          }}
                          className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-purple-600 shadow-sm"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={handleShareAffirmation}
                          className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-indigo-600 shadow-sm"
                          title="Share Affirmation"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={handleRefreshAffirmation}
                          disabled={refreshingAffirmation}
                          className="p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-cyan-600 disabled:opacity-50 shadow-sm"
                          title="New Affirmation"
                        >
                          <RefreshCw className={`w-6 h-6 ${refreshingAffirmation ? 'animate-spin text-purple-600' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Action Call to Action */}
                {currentStep !== 'complete' && (
                    <div 
                        onClick={() => setActiveModule(currentStep)}
                        className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 backdrop-blur-md hover:border-purple-500/50 transition-all shadow-xl"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className={`w-20 h-20 rounded-2xl bg-${nextModule?.color}-500/10 text-${nextModule?.color}-500 flex items-center justify-center shrink-0`}>
                                {nextModule && <nextModule.icon className="w-10 h-10" />}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className={`text-[10px] font-bold uppercase tracking-widest text-${nextModule?.color}-500 mb-1 block`}>Priority Discovery</span>
                                <h2 className="text-2xl font-bold dark:text-white mb-2">{nextModule?.title}</h2>
                                <p className="text-gray-500 text-sm">This is the key to unlocking your next level. Complete this to proceed.</p>
                            </div>
                            <button className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                Unlock Now <ArrowIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Daily Focus Section */}
                        {userData.archetype ? (
                             <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
                                    <h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><Target className="w-5 h-5 text-purple-500"/> Today's Focus</h2>
                                    <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
                                        {showReviewForm ? "View Tasks" : "Log Progress"}
                                    </button>
                                </div>
                                <div className="p-8">
                                    {showReviewForm ? (
                                        <div className="space-y-4">
                                             <textarea 
                                                value={reviewReport}
                                                onChange={e => setReviewReport(e.target.value)}
                                                placeholder="Briefly, how did your day go?"
                                                className="w-full h-32 p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-purple-500 text-sm"
                                            />
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    {[1,2,3,4,5].map(v => (
                                                        <button key={v} onClick={() => setEnergyLevel(v)} className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${energyLevel === v ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-white/5 text-gray-500'}`}>{v}</button>
                                                    ))}
                                                </div>
                                                <button onClick={handleDailyReview} disabled={!reviewReport.trim()} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm">Save Log</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <BlueprintTask icon={<Coffee />} title="Morning" task={dailyBlueprint?.morning.task} color="orange" />
                                            <BlueprintTask icon={<Sun />} title="Afternoon" task={dailyBlueprint?.afternoon.task} color="yellow" />
                                            <BlueprintTask icon={<Sunset />} title="Evening" task={dailyBlueprint?.evening.task} color="indigo" />
                                        </div>
                                    )}
                                </div>
                             </div>
                        ) : (
                            <div className="bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-[2rem] p-12 text-center">
                                <p className="text-gray-400 text-sm">Finish "Personality Type" to unlock daily focus tasks.</p>
                            </div>
                        )}

                        {/* NEW: Daily Goals Section */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-sm overflow-hidden animate-fade-in">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
                                <h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><ListChecks className="w-5 h-5 text-cyan-500"/> Personal Goals</h2>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {userData.dailyGoals?.filter((g: any) => g.completed).length || 0} / {userData.dailyGoals?.length || 0} Done
                                </span>
                            </div>
                            <div className="p-8 space-y-6">
                                <form onSubmit={handleAddGoal} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newGoalText}
                                        onChange={e => setNewGoalText(e.target.value)}
                                        placeholder="What's your goal for today?"
                                        className="flex-1 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-cyan-500 outline-none transition-all dark:text-white"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newGoalText.trim()}
                                        className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold disabled:opacity-50 hover:scale-105 transition-transform"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {userData.dailyGoals && userData.dailyGoals.length > 0 ? (
                                        userData.dailyGoals.map((goal: DailyGoal) => (
                                            <div key={goal.id} className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => toggleGoal(goal.id)}
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-gray-300 dark:border-gray-700'}`}
                                                    >
                                                        {goal.completed && <Check className="w-4 h-4" />}
                                                    </button>
                                                    <span className={`text-sm ${goal.completed ? 'text-gray-400 line-through' : 'dark:text-gray-200'}`}>
                                                        {goal.text}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => deleteGoal(goal.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-xs text-gray-400 italic">No goals set yet. What would you like to achieve today?</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {MODULES.filter(m => m.id !== currentStep).map(m => {
                                const isDone = !!userData[m.key];
                                const isLocked = m.requiredFor ? !userData[MODULES.find(x => x.id === m.requiredFor)?.key || ''] : false;
                                const reqModule = m.requiredFor ? MODULES.find(x => x.id === m.requiredFor) : null;
                                return (
                                    <div 
                                        key={m.id} 
                                        onClick={() => !isLocked && setActiveModule(m.id)} 
                                        className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group ${isLocked ? 'opacity-50 grayscale bg-gray-100/50 dark:bg-white/5 border-gray-200 dark:border-white/5 cursor-not-allowed' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:shadow-md'}`}
                                    >
                                        <div className={`p-3 rounded-xl ${isLocked ? 'bg-gray-200 dark:bg-white/5 text-gray-400' : `bg-${m.color}-500/10 text-${m.color}-500`}`}>
                                            {isLocked ? <Lock className="w-5 h-5" /> : <m.icon className="w-5 h-5"/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-sm truncate ${isLocked ? 'text-gray-500' : 'dark:text-white'}`}>{m.title}</h3>
                                            <div className="mt-1">
                                                {isLocked ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold uppercase tracking-tighter w-fit border border-amber-100 dark:border-amber-900/30">
                                                        <Info className="w-2.5 h-2.5" /> Requires {reqModule?.title}
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{isDone ? "Review Results" : m.desc}</p>
                                                )}
                                            </div>
                                        </div>
                                        {isDone && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-200 dark:border-white/10 flex flex-col min-h-[400px]">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2"><History className="w-4 h-4" /> Activity History</h3>
                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                            {userData.dailyLogs?.length > 0 ? (
                                userData.dailyLogs.map((log: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tighter">
                                            <span>{log.date}</span>
                                            <span className="text-green-500">{log.achievementScore}%</span>
                                        </div>
                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">"{log.growthSummary}"</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-10">Your daily growth reports will appear here.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {activeModule && (
            <div className="animate-fade-in max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                <button 
                    onClick={handleBackToHub} 
                    className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full transition-all z-50"
                >
                    <X className="w-5 h-5 dark:text-white" />
                </button>
                <button onClick={handleBackToHub} className="mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-purple-600 uppercase tracking-widest transition-colors"><ArrowLeft className="w-4 h-4"/> Back to Dashboard</button>
                {renderActiveModule()}
            </div>
        )}

        {/* Share Fallback Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[2rem] p-8 border border-gray-200 dark:border-white/10 shadow-2xl relative">
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold dark:text-white mb-4 text-center">Share the Light</h3>
              <p className="text-sm text-gray-500 text-center mb-8">Inspire your network with today's affirmation.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`" ${dailyAffirmationText} " \n\n Discover your path at Eunoia.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all border border-transparent hover:border-purple-200"
                >
                  <Twitter className="w-8 h-8 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">X / Twitter</span>
                </a>
                <a 
                   href={`https://wa.me/?text=${encodeURIComponent(`" ${dailyAffirmationText} " \n\n Discover your path at Eunoia: ${window.location.origin}`)}`}
                   target="_blank" rel="noopener noreferrer"
                   className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-transparent hover:border-green-200"
                >
                  <MessageCircle className="w-8 h-8 text-green-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">WhatsApp</span>
                </a>
              </div>
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(`"${dailyAffirmationText}" — Eunoia Sanctuary`);
                   alert("Copied to clipboard!");
                   setShowShareModal(false);
                }}
                className="w-full mt-6 py-4 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm text-gray-500 hover:text-purple-600 transition-colors"
              >
                Copy Text Instead
              </button>
            </div>
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
        if (res.success && res.data) {
            setMessages(p => [...p, { role: 'ai', reflection: res.data.reflection, question: res.data.question }]);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[500px] animate-fade-in">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold dark:text-white">Self Reflection</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Talk to your AI Guide about your day</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-white/5 dark:text-gray-300 rounded-tl-none border border-gray-200 dark:border-white/10'}`}>
                            {m.role === 'user' ? m.content : (
                                <div className="space-y-3">
                                    <p className="italic text-gray-500 dark:text-gray-400">"{m.reflection}"</p>
                                    <p className="font-bold text-gray-800 dark:text-white">{m.question}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-[10px] text-gray-400 animate-pulse">Your guide is thinking...</div>}
                <div ref={scrollRef}></div>
            </div>
            <div className="relative">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask a question or share a thought..." className="w-full p-4 pr-12 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-sm dark:text-white" />
                <button onClick={handleSend} className="absolute right-3 top-3 p-1.5 bg-purple-600 text-white rounded-lg"><Send className="w-4 h-4"/></button>
            </div>
        </div>
    );
};

const BlueprintTask = ({ icon, title, task, color }: any) => (
    <div className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-center flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-3`}>{icon}</div>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</span>
        <h4 className="text-xs font-bold dark:text-gray-200">{task || "Analysis pending..."}</h4>
    </div>
);

const QuizView = ({ questions, onComplete, color, icon }: any) => {
    const [idx, setIdx] = useState(0);
    const [ans, setAns] = useState<string[]>([]);
    const sel = (o: string) => { const n = [...ans, o]; setAns(n); if (idx < questions.length - 1) setIdx(idx + 1); else onComplete(n); };
    return (
        <div className="space-y-8 animate-fade-in max-w-xl mx-auto">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-2">{icon} Question {idx+1} of {questions.length}</span>
                <span>{Math.round(((idx+1)/questions.length)*100)}%</span>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all`} style={{width: `${((idx+1)/questions.length)*100}%`}}></div>
            </div>
            <h4 className="text-xl font-bold dark:text-white leading-snug">{questions[idx].text}</h4>
            <div className="grid gap-3">
                {questions[idx].options.map((o:string) => (
                    <button key={o} onClick={() => sel(o)} className="p-4 text-left border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 hover:border-purple-500/50 transition-all text-sm font-medium dark:text-white">
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ComprehensiveResultView = ({ title, data, color, onNext, onReset, nextStageLabel }: any) => {
    const [showFullAnalysis, setShowFullAnalysis] = useState(false);

    return (
        <div className="space-y-10 animate-fade-in max-w-4xl mx-auto text-center pb-20">
            <div className="space-y-4">
                <span className={`px-4 py-1 bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-${color}-500/20`}>{title}</span>
                <h3 className="text-4xl md:text-6xl font-bold dark:text-white">{data.title || data.archetype || data.temperament}</h3>
                <p className="text-gray-500 italic text-xl">"{data.tagline || data.mantra || 'A unique path of discovery'}"</p>
            </div>

            {/* Concise Summary Block */}
            {data.summary && (
                <div className="p-8 bg-purple-600 text-white rounded-[2.5rem] shadow-xl text-xl font-medium leading-relaxed italic animate-pulse-slow">
                    "{data.summary}"
                </div>
            )}

            {/* Toggleable Deep Analysis */}
            <div className="space-y-4">
                <button 
                    onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                    className="flex items-center gap-2 mx-auto text-sm font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:opacity-70 transition-opacity"
                >
                    {showFullAnalysis ? <><ChevronUp className="w-4 h-4"/> Hide Analysis</> : <><ChevronDown className="w-4 h-4"/> View Deep Analysis</>}
                </button>
                
                {showFullAnalysis && (
                    <div className="p-8 md:p-12 bg-gray-50 dark:bg-white/5 rounded-[3rem] text-lg leading-relaxed text-gray-700 dark:text-gray-300 italic border border-gray-200 dark:border-white/5 shadow-inner text-left animate-fade-in">
                        {data.description || data.insight || data.strengthAnalysis}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="p-8 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] shadow-sm">
                    <h4 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Check className="w-5 h-5"/> Key Strengths
                    </h4>
                    <ul className="space-y-3">
                        {data.strengths?.map((s:string) => (
                            <li key={s} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3 leading-snug">
                                <span className="text-emerald-500 mt-1 font-bold">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="p-8 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-[2.5rem] shadow-sm">
                    <h4 className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5"/> Growth Areas
                    </h4>
                    <ul className="space-y-3">
                        {(data.weaknesses || data.shadowTraits || data.shadowSide || data.stressTriggers)?.map((s:string) => (
                            <li key={s} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3 leading-snug">
                                <span className="text-orange-500 mt-1 font-bold">•</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Compact Detail Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                {[
                    { label: "Social", value: data.socialDynamics, icon: Globe },
                    { label: "Stress", value: data.stressManagement, icon: Shield },
                    { label: "Career", value: Array.isArray(data.careerAlignment) ? data.careerAlignment.join(', ') : data.careerAlignment, icon: Briefcase },
                    { label: "Focus", value: data.productivityHack, icon: Zap },
                    { label: "Space", value: data.idealEnvironment, icon: HomeIcon },
                    { label: "Priority", value: data.topPriority, icon: Target }
                ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                            <item.icon className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-3 leading-tight">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="p-10 md:p-14 bg-gradient-to-br from-slate-900 to-black text-white rounded-[3rem] text-left border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp className="w-48 h-48 rotate-[-15deg]" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-[0.3em] text-purple-400 mb-8 flex items-center gap-3">
                    <Map className="w-6 h-6" /> The Master Roadmap
                </h4>
                <div className="space-y-6 relative z-10">
                    {Array.isArray(data.wayForward) ? data.wayForward.map((step: any, i: number) => (
                        <div key={i} className="flex gap-6 items-start group/step">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0 group-hover/step:bg-purple-500 group-hover/step:text-white transition-all">
                                {i+1}
                            </div>
                            <p className="text-base md:text-lg font-medium leading-relaxed pt-0.5">{step}</p>
                        </div>
                    )) : (
                        <div className="text-lg font-medium leading-relaxed">
                            {data.wayForward}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button onClick={onNext} className="flex-1 py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] font-bold text-lg hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                    Proceed to {nextStageLabel || "Next Stage"} <ArrowIcon className="w-5 h-5" />
                </button>
                <button onClick={onReset} className="px-10 py-6 border border-gray-200 dark:border-white/10 rounded-[1.5rem] font-bold text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all text-base">Restart</button>
            </div>
        </div>
    );
};

// Simple utility to fix missing icon import in the grid above
const HomeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IkigaiForm = ({ onSubmit }: any) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ l:'', g:'', n:'', p:'' });
    const steps = [
        { key: 'l', title: 'What you LOVE', desc: 'Your Deep Interests & Passions', hints: ['What activities make you lose track of time?', 'What topics could you talk about forever?', 'What did you love doing as a child?'], examples: ['Painting', 'Coding', 'Helping People', 'Cooking', 'Scientific Discovery'] },
        { key: 'g', title: 'What you are GOOD AT', desc: 'Your Natural Skills & Strengths', hints: ['What do people always ask for your help with?', 'What tasks feel easier for you than for others?', 'What is a compliment you get often?'], examples: ['Organizing', 'Listening', 'Strategic Planning', 'Technical Writing', 'Public Speaking'] },
        { key: 'n', title: 'What the WORLD NEEDS', desc: 'Your Mission & Global Impact', hints: ['What problems in the world bother you?', 'If you had a magic wand, what would you fix?', 'What causes do you donate time/money to?'], examples: ['Climate Action', 'Better Education', 'Mental Health Support', 'Sustainable Tech'] },
        { key: 'p', title: 'What you can be PAID FOR', desc: 'Your Market Value & Vocation', hints: ['What services do people buy?', 'What skills are in high demand?', 'What have you been paid for in the past?'], examples: ['Consulting', 'Creating Content', 'Building Apps', 'Teaching', 'Design'] }
    ];
    const current = steps[step - 1];
    const next = () => { if (step < 4) setStep(step + 1); else onSubmit(f.l, f.g, f.n, f.p); };
    const addChip = (val: string) => { const key = current.key as keyof typeof f; setF({ ...f, [key]: f[key] ? `${f[key]}, ${val}` : val }); };
    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-1.5">{[1,2,3,4].map(s => (<div key={s} className={`w-10 h-2 rounded-full ${step >= s ? 'bg-pink-500' : 'bg-gray-200 dark:bg-white/10'}`}></div>))}</div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Discovery Phase {step} / 4</span>
            </div>
            <div className="text-center mb-10"><h3 className="text-4xl font-bold dark:text-white mb-3">{current.title}</h3><p className="text-gray-500 text-base">{current.desc}</p></div>
            <div className="space-y-8">
                <div className="bg-pink-50 dark:bg-pink-900/10 p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30">
                    <h4 className="text-[11px] font-bold text-pink-600 uppercase mb-4 flex items-center gap-2"><IdeaIcon className="w-4 h-4" /> Reflection Prompts</h4>
                    <ul className="space-y-3">{current.hints.map((h, i) => (<li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"><span className="text-pink-400 font-bold">•</span> {h}</li>))}</ul>
                </div>
                <div className="space-y-4">
                    <textarea value={f[current.key as keyof typeof f]} onChange={e => setF({...f, [current.key]: e.target.value})} placeholder="Express your thoughts deeply..." className="w-full p-6 border border-gray-200 dark:border-white/10 rounded-[2rem] bg-gray-50 dark:bg-black/30 dark:text-white text-lg h-44 outline-none focus:ring-4 ring-pink-500/20 transition-all shadow-inner" />
                    <div className="flex flex-wrap gap-2.5">{current.examples.map(ex => (<button key={ex} onClick={() => addChip(ex)} className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold text-gray-500 hover:border-pink-500/50 hover:text-pink-500 transition-all">+ {ex}</button>))}</div>
                </div>
            </div>
            <div className="flex gap-4 pt-10">{step > 1 && (<button onClick={() => setStep(step - 1)} className="px-8 py-5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-base hover:bg-gray-200 transition-all">Back</button>)}
                <button onClick={next} disabled={!f[current.key as keyof typeof f].trim()} className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">{step === 4 ? 'Complete Purpose Mapping' : 'Next Phase'} <ArrowIcon className="w-5 h-5" /></button>
            </div>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, data }: any) => {
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ age: data.age || '', principles: data.principles || '', likes: data.likes || '', dislikes: data.dislikes || '', region: data.region || '', religion: data.religion || '' });
    return (
        <div className="space-y-10 animate-fade-in max-w-xl mx-auto">
            <div className="text-center"><h3 className="text-3xl font-bold dark:text-white">Master Strategy Setup</h3><p className="text-gray-500 text-sm mt-2">Finalizing your psychological profile for the Master Life Plan.</p></div>
            {step === 1 ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Current Age</label>
                            <input value={f.age} onChange={e => setF({...f, age:e.target.value})} placeholder="e.g. 24" className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white" />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Location / Region</label>
                             <input value={f.region} onChange={e => setF({...f, region:e.target.value})} placeholder="e.g. Europe" className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Personal Philosophy / Religion</label>
                         <input value={f.religion} onChange={e => setF({...f, religion:e.target.value})} placeholder="e.g. Stoicism, Existentialism..." className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white" />
                    </div>
                    <button onClick={() => setStep(2)} className="w-full py-5 bg-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-purple-700 transition-all">Proceed to Final Details</button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">What truly makes you happy?</label>
                        <textarea value={f.likes} onChange={e => setF({...f, likes:e.target.value})} placeholder="Deep interests, hobbies, feelings..." className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white h-24 resize-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">What frustrates you most?</label>
                        <textarea value={f.dislikes} onChange={e => setF({...f, dislikes:e.target.value})} placeholder="Pet peeves, difficult environments..." className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white h-24 resize-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Your 3 Core Life Principles</label>
                        <textarea value={f.principles} onChange={e => setF({...f, principles:e.target.value})} placeholder="Honesty, Freedom, Impact..." className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/30 dark:text-white h-28 resize-none" />
                    </div>
                    <button onClick={() => onSubmit(f)} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-xl hover:opacity-90 transition-all">Generate Master Life Strategy</button>
                </div>
            )}
        </div>
    );
};

const ShadowReadinessView = ({ onGenerate }: any) => (
    <div className="text-center py-20 space-y-8 animate-fade-in max-w-md mx-auto">
        <div className="p-8 bg-slate-100 dark:bg-white/5 rounded-full w-28 h-28 flex items-center justify-center mx-auto border border-slate-200 dark:border-white/10 shadow-inner">
            <Ghost className="w-14 h-14 text-slate-400"/>
        </div>
        <div>
            <h2 className="text-3xl font-bold dark:text-white mb-2">Shadow Discovery</h2>
            <p className="text-base text-gray-500 leading-relaxed italic">"One does not become enlightened by imagining figures of light, but by making the darkness conscious." — Carl Jung</p>
        </div>
        <button onClick={onGenerate} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl">Start Shadow Analysis</button>
    </div>
);

const IdentityView = ({ data, onGenerate, onBack }: any) => (
    <div className="flex flex-col items-center gap-10 py-12 animate-fade-in max-w-sm mx-auto">
        {!data.nickname ? (
            <div className="text-center space-y-8">
                <div className="w-24 h-24 bg-amber-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto border border-amber-100 dark:border-white/10 shadow-inner">
                    <Shield className="w-12 h-12 text-amber-400"/>
                </div>
                <div className="space-y-2">
                    <h3 className="text-3xl font-bold dark:text-white">Sanctuary Name</h3>
                    <p className="text-sm text-gray-500 px-6">Allow our AI to synthesize your personality into a unique moniker for your dashboard.</p>
                </div>
                <button onClick={onGenerate} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">Forge My Identity</button>
            </div>
        ) : (
            <div className="bg-white dark:bg-white/10 p-12 rounded-[3rem] text-center shadow-2xl border border-gray-200 dark:border-white/10 w-full relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-bold shadow-xl">{(data.nickname || 'S')[0]}</div>
                <h4 className="text-3xl font-bold dark:text-white mb-2">{data.nickname}</h4>
                <p className="text-xs uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 font-bold mb-8">{data.archetype?.archetype || 'Sanctuary Seeker'}</p>
                <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold opacity-40">
                        <span>Rank</span>
                        <span>Level {data.synthesis ? '4' : data.ikigai ? '3' : data.temperament ? '2' : '1'}</span>
                    </div>
                </div>
            </div>
        )}
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-4 transition-colors">Return to Dashboard Hub</button>
    </div>
);

const PERSONALITY_QUESTIONS = [
    { id: 1, text: "After a socially exhausting week, your ideal way to recover is:", options: ["Going out for a spontaneous adventure with friends", "Staying home with a specific hobby or project", "A small gathering with 1-2 trusted people", "Organizing your space for the coming week"] },
    { id: 2, text: "When you walk into a crowded room, you usually:", options: ["Scan for people you know to start talking", "Find a quiet spot to observe the vibe first", "Think about the logistics of the event", "Worry about how you are being perceived"] },
    { id: 3, text: "In a deep debate, you are more focused on:", options: ["Winning with logic and facts", "Finding a compromise that everyone likes", "The hidden meaning or 'vibe' behind the words", "The practical application of the idea"] },
    { id: 4, text: "Your approach to new information is usually:", options: ["Skeptical until I see it work in reality", "Excited by the possibilities and connections", "Trying to fit it into my existing belief system", "Critically analyzing it for flaws in logic"] },
    { id: 5, text: "When a friend is crying, your immediate internal reaction is:", options: ["What do they need me to DO to fix this?", "How can I help them feel emotionally safe?", "I feel their pain as if it were my own", "Why are they reacting this way logically?"] },
    { id: 6, text: "If you had a free Saturday, you would most likely:", options: ["Finish my checklist to feel productive", "Start a new creative project I'm excited about", "Learn something new or read a book", "Spend quality time with family or partners"] },
    { id: 7, text: "When making a major decision, you rely most on:", options: ["Your gut feeling / intuition", "A pros and cons list / data", "How it affects the people you love", "Past experiences and what has worked before"] },
    { id: 8, text: "You feel most accomplished when you:", options: ["Lead a group to a successful outcome", "Understand a complex concept deeply", "Create something beautiful or meaningful", "Have a perfectly structured and safe life"] },
    { id: 9, text: "In your workspace, you prefer:", options: ["Total silence and solitude", "The buzz of a busy cafe or office", "An organized, clean, and aesthetic setup", "A flexible space that changes with your needs"] },
    { id: 10, text: "When you fail at something, your first thought is:", options: ["What did I miss? Let's analyze the failure.", "How do I recover my reputation/status?", "I'm a failure as a person (emotional)", "Who else is involved in this mess?"] }
];

const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "Your natural energy level in the morning is:", options: ["A burst of energy - ready to go!", "A slow, foggy build-up over hours", "Varies wildly depending on my mood", "Consistent and calm, regardless of time"] },
    { id: 2, text: "When you face a sudden obstacle, your energy:", options: ["Spikes into frustration or immediate action", "Tanks - I feel drained and need to retreat", "Stays steady - I just work through it", "Flashes - I get excited by the challenge"] },
    { id: 3, text: "Your 'social battery' usually lasts:", options: ["All night - I gain energy from others", "2-3 hours then I need immediate solitude", "Longer with friends, zero time with strangers", "I don't really have a 'battery' - I'm just steady"] },
    { id: 4, text: "In terms of physical movement, you are naturally:", options: ["Restless and constantly moving", "Slower, deliberate, and calm", "Intense and forceful", "Graceful and light"] },
    { id: 5, text: "Your emotions tend to be:", options: ["Intense but short-lived", "Deep, quiet, and long-lasting", "Frequent, visible, and expressive", "Rare, private, and very stable"] },
    { id: 6, text: "When you are extremely stressed, you naturally:", options: ["Become angry and demanding", "Become tearful and withdrawn", "Become frantic and over-talkative", "Become robotic and detached"] },
    { id: 7, text: "Your ideal pace of life is:", options: ["Fast-paced and high-stakes", "Slow, peaceful, and predictable", "Creative, varied, and emotional", "Routine-driven and efficient"] },
    { id: 8, text: "People would most likely describe you as:", options: ["The life of the party", "The rock/steady one", "The visionary/intense one", "The sensitive/thinker one"] }
];

export default DashboardPage;
