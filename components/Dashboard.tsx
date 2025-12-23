
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, Droplets, Wind, Mountain,
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus, Ghost, Eye, Send, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight, getDailyOracleReflection, consultTheMirror, generateShadowWork } from '../services/geminiService';
import { fetchMentors, Mentor, saveUserProgress, getUserProfile } from '../services/adminService';

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

const PERSONALITY_QUESTIONS = [
    { id: 1, text: "You've had a long, exhausting week. How do you choose to recharge?", options: ["A lively dinner or outing with friends to vent and laugh.", "Complete solitude with a book, game, or hobby.", "Exploring a new environment or city streets.", "Productive catch-up on personal projects."] },
    { id: 2, text: "When you look at a painting or a complex image, what strikes you first?", options: ["The specific details, colors, and brushstrokes.", "The overall mood, meaning, or symbolism.", "The technique and skill required to create it.", "How it makes me feel personally."] },
    { id: 3, text: "A friend comes to you with a dilemma. Your immediate instinct is to:", options: ["Offer a logical solution to fix the problem.", "Offer emotional support and validate their feelings.", "Ask questions to understand the deeper context.", "Distract them with something fun to cheer them up."] },
    { id: 4, text: "How do you handle your daily schedule?", options: ["I plan everything in advance; lists are my life.", "I have a rough idea but keep options open.", "I prefer spontaneity and adapt as I go.", "I focus on one deadline at a time, often last minute."] },
    { id: 5, text: "In a heated debate, you are more likely to:", options: ["Prioritize truth and facts, even if it hurts feelings.", "Prioritize harmony and finding common ground.", "Play devil's advocate to explore all angles.", "Withdraw to observe or avoid conflict."] }
];

const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "How would you describe your natural energy levels?", options: ["Consistently high and active (I rarely sit still).", "Bursts of high energy followed by low dips.", "Steady, calm, and deliberate.", "Low-key, thoughtful, and reserved."] },
    { id: 2, text: "When faced with a sudden, unexpected problem, you:", options: ["Get angry but immediately take action to fix it.", "Feel flustered but try to stay optimistic.", "Analyze the cause deeply before acting.", "Stay calm and wait to see if it resolves itself."] },
    { id: 3, text: "How do you handle anger?", options: ["It explodes quickly but I get over it fast.", "I express it loudly but forget why I was mad later.", "I hold onto it and remember it for a long time.", "I rarely get angry; I prefer to keep the peace."] }
];

const MODULES = [
  { id: 'personality', title: 'Personality Archetype', desc: 'Uncover your cognitive core.', icon: User, color: 'purple' },
  { id: 'temperament', title: 'Temperament Matrix', desc: 'Discover your energy rhythm.', icon: Activity, color: 'cyan' },
  { id: 'ikigai', title: 'Ikigai Alignment', desc: 'Find your true purpose.', icon: Compass, color: 'pink' },
  { id: 'synthesis', title: 'Life Strategy', desc: 'Synthesize your roadmap.', icon: Brain, color: 'emerald' },
  { id: 'mirror', title: 'The Mirror Chamber', desc: 'Active reflection on life path.', icon: Eye, color: 'indigo' },
  { id: 'shadow', title: 'Shadow Mirror', desc: 'Integrate your hidden traits.', icon: Ghost, color: 'slate' },
  { id: 'identity', title: 'Sanctuary Badge', desc: 'Your digital soul and nickname.', icon: Shield, color: 'indigo' },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Results');
  const [userData, setUserData] = useState<any>({
    archetype: null, temperament: null, ikigai: null, synthesis: null,
    age: '', principles: '', nickname: '', shadowWork: null
  });
  const [oracleReflection, setOracleReflection] = useState<any>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    let unsubscribe: any;
    const initData = async (uid: string) => {
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                setUserData(prev => ({ ...prev, ...profile }));
                if (profile.archetype || profile.temperament) {
                    const res = await getDailyOracleReflection(profile);
                    if (res.success) setOracleReflection(res.data);
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

  const handleResetModule = async (moduleId: string) => {
      if (window.confirm("Are you sure you want to reset this module? Your current insights will be replaced.")) {
          const updates: any = { [moduleId]: null };
          // If we reset a core pillar, we should probably reset synthesis too
          if (['personality', 'temperament', 'ikigai'].includes(moduleId)) {
              updates.synthesis = null;
          }
          setUserData({ ...userData, ...updates });
          await saveProgress(updates);
          setQuizStarted(false);
      }
  };

  const handlePersonalityComplete = async (answers: string[]) => {
    setLoading(true); setLoadingMessage('Analyzing Archetypes'); setError(null);
    const res = await analyzePersonality(answers.join('; '), '');
    if (res.success) {
        setUserData({ ...userData, archetype: res.data });
        await saveProgress({ archetype: res.data });
    } else setError(res.error || "Analysis failed.");
    setLoading(false);
  };

  const handleTemperamentComplete = async (answers: string[]) => {
    setLoading(true); setLoadingMessage('Calculating Energy'); setError(null);
    const res = await analyzeTemperament(answers.join('; '), '');
    if (res.success) {
        setUserData({ ...userData, temperament: res.data });
        await saveProgress({ temperament: res.data });
    } else setError(res.error || "Analysis failed.");
    setLoading(false);
  };

  const handleIkigaiComplete = async (love: string, goodAt: string, needs: string, pay: string) => {
    setLoading(true); setLoadingMessage('Aligning Purpose'); setError(null);
    const res = await generateIkigaiInsight(love, goodAt, needs, pay);
    if (res.success) {
        setUserData({ ...userData, ikigai: res.data });
        await saveProgress({ ikigai: res.data });
    } else setError(res.error || "Alignment failed.");
    setLoading(false);
  };

  const handleSynthesisComplete = async (formData: any) => {
    setLoading(true); setLoadingMessage('Synthesizing Master Strategy'); setError(null);
    const res = await generateLifeSynthesis({ ...userData, ...formData });
    if (res.success) {
        setUserData({ ...userData, ...formData, synthesis: res.data });
        await saveProgress({ ...formData, synthesis: res.data });
    } else setError(res.error || "Synthesis failed.");
    setLoading(false);
  };

  const handleShadowWorkGenerate = async () => {
    setLoading(true); setLoadingMessage('Opening the Shadow Mirror'); setError(null);
    const res = await generateShadowWork(userData);
    if (res.success) {
        setUserData({ ...userData, shadowWork: res.data });
        await saveProgress({ shadowWork: res.data });
    } else setError(res.error || "Integration failed.");
    setLoading(false);
  };

  const handleNickname = async () => {
    setLoading(true); setLoadingMessage('Divining Name');
    const nick = await generateNickname(userData.archetype?.archetype || 'Seeker');
    setUserData({ ...userData, nickname: nick });
    await saveProgress({ nickname: nick });
    setLoading(false);
  };

  const renderActiveModule = () => {
      if (loading) return <DynamicLoader text={loadingMessage} />;
      const handleBack = () => { setActiveModule(null); setError(null); setQuizStarted(false); };
      
      switch(activeModule) {
          case 'personality':
              return !userData.archetype ? (
                  !quizStarted ? <ReadinessView onStart={() => setQuizStarted(true)} /> :
                  <QuizView title="Personality Archetype" questions={PERSONALITY_QUESTIONS} onComplete={handlePersonalityComplete} color="purple" icon={<User className="text-purple-500"/>} />
              ) : <ComprehensiveResultView title="Archetype Analysis" data={userData.archetype} color="purple" onNext={handleBack} onReset={() => handleResetModule('archetype')} />;
          case 'temperament':
              return !userData.temperament ? (
                  <QuizView title="Temperament Matrix" questions={TEMPERAMENT_QUESTIONS} onComplete={handleTemperamentComplete} color="cyan" icon={<Activity className="text-cyan-500"/>} />
              ) : <ComprehensiveResultView title="Temperament Analysis" data={userData.temperament} color="cyan" onNext={handleBack} onReset={() => handleResetModule('temperament')} />;
          case 'ikigai':
              return !userData.ikigai ? <IkigaiForm onSubmit={handleIkigaiComplete} /> : 
              <ComprehensiveResultView title="Ikigai Compass" data={userData.ikigai} color="pink" onNext={handleBack} onReset={() => handleResetModule('ikigai')} />;
          case 'synthesis':
              return !userData.synthesis ? <SynthesisForm onSubmit={handleSynthesisComplete} data={userData} /> :
              <SynthesisResultView data={userData.synthesis} onBack={handleBack} onReset={() => handleResetModule('synthesis')} />;
          case 'mirror':
              return <MirrorChamberView profile={userData} onBack={handleBack} />;
          case 'shadow':
              return !userData.shadowWork ? <ShadowReadinessView onGenerate={handleShadowWorkGenerate} /> :
              <ShadowWorkView data={userData.shadowWork} onBack={handleBack} onReset={() => handleResetModule('shadowWork')} />;
          case 'identity':
              return <IdentityView data={userData} onGenerate={handleNickname} onBack={handleBack} />;
          default: return null;
      }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-black">
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="mb-8 space-y-8 animate-fade-in">
                <div className="text-center">
                    <h1 className="text-4xl font-serif font-bold mb-2">The Sanctuary Hub</h1>
                    <p className="text-gray-500">The journey through your core is {Math.round((MODULES.filter(m => userData[m.id]).length / (MODULES.length-1)) * 100)}% complete.</p>
                </div>
                {oracleReflection && (
                    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-cyan-300 font-bold uppercase tracking-[0.2em] border border-cyan-500/30">Sanctuary Oracle</span>
                                <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">Focus: {oracleReflection.focus}</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-serif text-white italic mb-6 leading-tight">"{oracleReflection.quote}"</h3>
                            <div className="flex flex-col md:flex-row gap-6 md:items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex-1">
                                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Today's Ritual</div>
                                    <p className="text-sm text-gray-200 font-medium">{oracleReflection.dailyRite || "Observe your breath for 3 deep cycles before every task today."}</p>
                                </div>
                                <div className="text-xs text-gray-400 italic">
                                    — {oracleReflection.affirmation}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
        <div className={`bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl transition-all ${activeModule ? 'max-w-3xl mx-auto' : ''}`}>
            {error && <div className="mb-6 bg-red-50 p-4 rounded-xl flex gap-3 items-center text-red-700 text-sm font-medium animate-fade-in"><AlertTriangle className="w-5 h-5"/>{error}</div>}
            {activeModule ? (
                <div className="animate-fade-in">
                    <button onClick={() => setActiveModule(null)} className="mb-8 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-purple-500 uppercase tracking-widest transition-colors"><ArrowLeft className="w-4 h-4"/> Back to Hub</button>
                    {renderActiveModule()}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MODULES.map(m => {
                        const locked = (m.id === 'temperament' && !userData.archetype) || 
                                      (m.id === 'ikigai' && !userData.temperament) || 
                                      (m.id === 'synthesis' && !userData.ikigai) ||
                                      (m.id === 'mirror' && !userData.archetype) ||
                                      (m.id === 'shadow' && !userData.archetype);
                        const done = userData[m.id];
                        return (
                            <div key={m.id} onClick={() => !locked && setActiveModule(m.id)} className={`p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${locked ? 'opacity-40 bg-gray-50' : 'hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-white/5 border-gray-100 dark:border-white/10'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl bg-${m.color}-100 dark:bg-${m.color}-900/30 text-${m.color}-500`}><m.icon className="w-6 h-6"/></div>
                                    {locked ? <Lock className="w-5 h-5 text-gray-300"/> : done ? <Check className="w-5 h-5 text-green-500"/> : <Play className="w-5 h-5 text-purple-500 animate-pulse"/>}
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-2">{m.title}</h3>
                                <p className="text-sm text-gray-500 mb-6">{m.desc}</p>
                                <span className={`text-xs font-bold uppercase tracking-widest text-${m.color}-500 flex items-center gap-1`}>{locked ? 'Locked' : done ? 'Open' : 'Begin'} <ChevronRight className="w-3 h-3"/></span>
                                
                                {done && !locked && <div className="absolute top-0 right-0 w-2 h-full bg-green-500/20"></div>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- MIRROR CHAMBER (CHAT) COMPONENT ---
const MirrorChamberView = ({ profile, onBack }: any) => {
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{role: 'ai', text: `Welcome to the Mirror Chamber, ${profile.nickname || 'Seeker'}. I am the reflection of your core psyche. What life crossroads or internal question shall we explore today?`}]);
        }
    }, [profile]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userText = input;
        setInput('');
        setMessages(prev => [...prev, {role: 'user', text: userText}]);
        setLoading(true);
        
        const res = await consultTheMirror(userText, profile);
        if (res.success && res.data) {
            setMessages(prev => [...prev, {role: 'ai', text: res.data.response + "\n\n" + (res.data.reflectionQuestion || '')}]);
        } else {
            setMessages(prev => [...prev, {role: 'ai', text: "The reflection is clouded... please try again."}]);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[600px] animate-fade-in">
            <div className="text-center mb-6">
                <h3 className="text-3xl font-serif font-bold">The Mirror Chamber</h3>
                <p className="text-sm text-gray-500">Conversing with your inner reflection.</p>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4 mb-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-bl-none shadow-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-white/10">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask the Mirror..."
                    className="flex-1 p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// --- SHADOW WORK COMPONENT ---
const ShadowReadinessView = ({ onGenerate }: any) => (
    <div className="text-center py-12 space-y-8 animate-fade-in">
        <Ghost className="w-16 h-16 text-slate-400 mx-auto opacity-50"/>
        <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Entering the Shadow</h2>
            <p className="text-gray-500 max-w-sm mx-auto">Shadow work is the integration of the traits we deny. It requires bravery and self-compassion. Are you ready to see what's hidden?</p>
        </div>
        <button onClick={onGenerate} className="px-12 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl flex items-center justify-center gap-2 mx-auto"><Eye className="w-5 h-5"/> Open Shadow Mirror</button>
    </div>
);

const ShadowWorkView = ({ data, onBack, onReset }: any) => (
    <div className="space-y-10 animate-fade-in max-w-3xl mx-auto pb-10">
        <div className="text-center space-y-4">
            <span className="px-4 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Shadow Integration</span>
            <h3 className="text-5xl font-serif font-bold">The Shadow Portrait</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 bg-slate-900 text-white rounded-3xl border border-white/10 shadow-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Ghost className="w-4 h-4"/> Denial Traits</h4>
                <ul className="space-y-4">
                    {data.shadowTraits?.map((t:string) => <li key={t} className="text-lg font-serif italic border-l-2 border-slate-700 pl-4">{t}</li>)}
                </ul>
            </div>
            <div className="p-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest">The Mirror Exercise</h4>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{data.theMirrorExercise}</p>
            </div>
        </div>

        <div className="p-8 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-800/30">
            <h4 className="font-bold mb-6 text-purple-700 dark:text-purple-300 font-serif text-xl">Journal Inquiries</h4>
            <div className="space-y-4">
                {data.journalPrompts?.map((p:string, i:number) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                        <p className="text-gray-700 dark:text-gray-200 italic">"{p}"</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center bg-slate-50 dark:bg-white/5 p-6 rounded-2xl italic text-slate-500 font-serif">
            Mantra: "{data.integrationMantra}"
        </div>

        <div className="flex gap-4">
            <button onClick={onBack} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-bold">Return to Hub</button>
            <button onClick={onReset} className="px-8 py-5 border rounded-2xl font-bold flex items-center gap-2 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors"><RotateCcw className="w-4 h-4"/> Reset</button>
        </div>
    </div>
);

// --- ASSESSMENT COMPONENTS ---

const ReadinessView = ({ onStart }: any) => (
    <div className="text-center py-12 space-y-8 animate-fade-in">
        <div className="inline-block p-6 bg-purple-50 dark:bg-purple-900/10 rounded-full"><Sparkles className="w-12 h-12 text-purple-600"/></div>
        <div>
            <h2 className="text-3xl font-serif font-bold mb-4">Prepare Your Mind</h2>
            <p className="text-gray-500 max-w-sm mx-auto">Take a deep breath. To find your true reflection, the Oracle requires your complete honesty.</p>
        </div>
        <button onClick={onStart} className="px-12 py-4 bg-gray-900 text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform">Begin Assessment</button>
    </div>
);

const QuizView = ({ questions, onComplete, color, icon }: any) => {
    const [idx, setIdx] = useState(0);
    const [ans, setAns] = useState<string[]>([]);
    const sel = (o: string) => { const n = [...ans, o]; setAns(n); if (idx < questions.length - 1) setIdx(idx + 1); else onComplete(n); };
    return (
        <div className="space-y-8 max-w-xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span className="flex items-center gap-2">{icon} Step {idx+1} of {questions.length}</span>
                <span>{Math.round(((idx+1)/questions.length)*100)}%</span>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all`} style={{width: `${((idx+1)/questions.length)*100}%`}}></div>
            </div>
            <h4 className="text-2xl font-serif font-bold leading-snug">{questions[idx].text}</h4>
            <div className="grid gap-3">
                {questions[idx].options.map(o => (
                    <button key={o} onClick={() => sel(o)} className="p-5 text-left border border-gray-100 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-500/50 transition-all font-medium flex justify-between group">
                        {o} <ArrowIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 text-purple-500 transition-all"/>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ComprehensiveResultView = ({ title, data, color, onNext, onReset }: any) => (
    <div className="space-y-10 animate-fade-in max-w-2xl mx-auto pb-10">
        <div className="text-center space-y-4">
            <span className={`px-4 py-1 bg-${color}-100 text-${color}-600 rounded-full text-[10px] font-bold uppercase tracking-widest`}>{title}</span>
            <h3 className="text-5xl font-serif font-bold">{data.archetype || data.temperament || data.title}</h3>
            <p className="italic text-lg text-gray-500 font-serif">"{data.tagline || data.element || 'Your Journey'}"</p>
        </div>
        <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-3xl text-lg leading-relaxed text-gray-600 italic">"{data.description || data.insight}"</div>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex gap-2"><Sparkles className="w-4 h-4"/> Strengths</h4>
                <ul className="space-y-2">{data.strengths?.map((s:string) => <li key={s} className="text-sm font-medium flex gap-2"><Check className="w-3 h-3 text-emerald-500 shrink-0 mt-1"/>{s}</li>)}</ul>
            </div>
            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 rounded-2xl">
                <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-4 flex gap-2"><AlertTriangle className="w-4 h-4"/> Challenge Zones</h4>
                <ul className="space-y-2">{(data.shadowSide || data.stressTriggers || data.weaknesses)?.map((s:string) => <li key={s} className="text-sm font-medium flex gap-2"><Minus className="w-3 h-3 text-rose-400 shrink-0 mt-1"/>{s}</li>)}</ul>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={onNext} className="flex-1 py-5 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:scale-[1.01] transition-transform">Return to Hub</button>
            <button onClick={onReset} className="px-8 py-5 border rounded-2xl font-bold text-gray-400 hover:text-purple-500 hover:border-purple-200 transition-all flex items-center gap-2"><RotateCcw className="w-4 h-4"/> Retake</button>
        </div>
    </div>
);

const IkigaiForm = ({ onSubmit }: any) => {
    const [f, setF] = useState({ l:'', g:'', n:'', p:'' });
    const disabled = !f.l || !f.g || !f.n || !f.p;
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2"><h3 className="text-3xl font-serif font-bold">The Ikigai Pillars</h3><p className="text-gray-500">Define the vectors of your life.</p></div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-pink-500">Love</label><textarea value={f.l} onChange={e => setF({...f, l:e.target.value})} placeholder="What sparks joy?" className="w-full p-4 border rounded-2xl bg-gray-50 dark:bg-white/5 resize-none h-24 focus:ring-2 ring-pink-500 outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-emerald-500">Skills</label><textarea value={f.g} onChange={e => setF({...f, g:e.target.value})} placeholder="What are you good at?" className="w-full p-4 border rounded-2xl bg-gray-50 dark:bg-white/5 resize-none h-24 focus:ring-2 ring-emerald-500 outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-cyan-500">Need</label><textarea value={f.n} onChange={e => setF({...f, n:e.target.value})} placeholder="What does the world need?" className="w-full p-4 border rounded-2xl bg-gray-50 dark:bg-white/5 resize-none h-24 focus:ring-2 ring-cyan-500 outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-indigo-500">Pay</label><textarea value={f.p} onChange={e => setF({...f, p:e.target.value})} placeholder="What can you be paid for?" className="w-full p-4 border rounded-2xl bg-gray-50 dark:bg-white/5 resize-none h-24 focus:ring-2 ring-indigo-500 outline-none" /></div>
            </div>
            <button disabled={disabled} onClick={() => onSubmit(f.l, f.g, f.n, f.p)} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold disabled:opacity-50 hover:scale-[1.01] transition-transform">Map My Purpose</button>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, data }: any) => {
    const [f, setF] = useState({ age: data.age || '', principles: data.principles || '' });
    return (
        <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <div className="text-center space-y-2"><h3 className="text-3xl font-serif font-bold">Final Synthesis</h3><p className="text-gray-500">The master plan for your path ahead.</p></div>
            <div className="space-y-4">
                <input value={f.age} onChange={e => setF({...f, age:e.target.value})} placeholder="Your Age" className="w-full p-4 border rounded-2xl bg-gray-50 dark:bg-white/5" />
                <textarea value={f.principles} onChange={e => setF({...f, principles:e.target.value})} placeholder="Core Life Principles" className="w-full p-4 border rounded-2xl bg-gray-50 dark:bg-white/5 h-32" />
            </div>
            <button onClick={() => onSubmit(f)} className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-xl"><Sparkles className="w-5 h-5"/> Generate Roadmap</button>
        </div>
    );
};

const SynthesisResultView = ({ data, onBack, onReset }: any) => (
    <div className="space-y-12 animate-fade-in">
        <div className="text-center space-y-6">
            <h3 className="text-5xl font-serif font-bold">Your Path Ahead</h3>
            <div className="p-8 bg-indigo-950 text-white rounded-3xl italic text-2xl font-serif border border-white/10 shadow-xl">"{data.mantra}"</div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl">
                <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4 flex gap-2"><Briefcase className="w-4 h-4"/> Strength Leverage</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{data.strengthAnalysis}</p>
            </div>
            <div className="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl">
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 flex gap-2"><AlertTriangle className="w-4 h-4"/> Critical Bridge</h4>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{data.weaknessAnalysis}</p>
            </div>
        </div>
        <div className="space-y-8">
            <h4 className="text-2xl font-serif font-bold flex items-center gap-2"><Map className="w-6 h-6 text-cyan-500"/> The Chronological Roadmap</h4>
            <div className="space-y-4">
                {data.roadmap?.map((p: any, i: number) => (
                    <div key={i} className="flex gap-6 relative group">
                        <div className="flex flex-col items-center shrink-0">
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm z-10">{i+1}</div>
                            {i < 2 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-white/10 my-2"></div>}
                        </div>
                        <div className="flex-1 pb-8">
                            <h5 className="text-xs font-bold text-purple-500 uppercase tracking-widest">{p.phase}</h5>
                            <h6 className="text-xl font-bold font-serif mb-2">{p.goal}</h6>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {p.actions.map((act:string) => <li key={act} className="text-xs text-gray-500 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-100 dark:border-white/5 flex gap-2"><TrendingUp className="w-3 h-3 text-cyan-500 shrink-0"/>{act}</li>)}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <button onClick={() => alert("Strategy Archiving in Progress.")} className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"><Download className="w-4 h-4"/> Export Strategy</button>
            <button onClick={onBack} className="px-8 py-5 border dark:border-white/20 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/5">Return</button>
            <button onClick={onReset} className="px-8 py-5 border dark:border-white/20 rounded-2xl font-bold text-gray-400 hover:text-purple-500 transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4"/> Reset</button>
        </div>
    </div>
);

const IdentityView = ({ data, onGenerate, onBack }: any) => (
    <div className="flex flex-col items-center gap-10 py-10">
        {!data.nickname ? (
            <div className="text-center space-y-6">
                <Shield className="w-20 h-20 text-indigo-500 mx-auto opacity-20" />
                <h2 className="text-3xl font-serif font-bold">Sanctuary Identity</h2>
                <p className="text-gray-500 max-w-xs mx-auto">Receive your mystical name and digital soul badge.</p>
                <button onClick={onGenerate} className="px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold shadow-xl hover:scale-[1.01] transition-transform">Reveal Identity</button>
            </div>
        ) : (
            <>
                <div className="w-[320px] h-[460px] bg-indigo-950 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/20 p-8 flex flex-col items-center text-center text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black opacity-80" />
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                    <div className="relative z-10 w-full h-full flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] tracking-[0.4em] font-serif opacity-50 mb-10">EUNOIA SANCTUARY</div>
                            <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center text-5xl font-serif mb-6 border border-white/20 shadow-inner">{data.nickname[0]}</div>
                            <h4 className="text-3xl font-serif font-bold mb-1">{data.nickname}</h4>
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-purple-400">{data.archetype?.archetype || 'Seeker'}</p>
                        </div>
                        <div className="space-y-3 border-t border-white/10 pt-6">
                            <div className="flex justify-between text-[9px] uppercase tracking-wider opacity-60"><span>Energy Matrix</span><span className="text-cyan-400">{data.temperament?.temperament || 'Pending'}</span></div>
                            <div className="flex justify-between text-[9px] uppercase tracking-wider opacity-60"><span>Inner Element</span><span className="text-orange-400">{data.temperament?.element || 'N/A'}</span></div>
                            <div className="flex justify-between text-[9px] uppercase tracking-wider opacity-60"><span>Year of Initiation</span><span>{new Date().getFullYear()}</span></div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => alert("Badge Exported.")} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">Export Badge</button>
                    <button onClick={onBack} className="px-8 py-3 border dark:border-white/20 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/5">Return</button>
                </div>
            </>
        )}
    </div>
);

export default DashboardPage;
