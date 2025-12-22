
import React, { useState, useEffect } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, Droplets, Wind, Mountain,
  Heart, Briefcase, Zap, Layers, Target, Clock, BookOpen, Fingerprint, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2, Map, Calendar, TrendingUp, Minus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight, getDailyOracleReflection } from '../services/geminiService';
import { fetchMentors, Mentor, saveUserProgress, getUserProfile } from '../services/adminService';

// --- LOADING COMPONENT ---
const DynamicLoader = ({ text }: { text: string }) => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
        setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in h-full min-h-[400px]">
        <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin relative z-10" />
        </div>
        <p className="text-xl font-medium text-purple-900 dark:text-purple-100 animate-pulse text-center max-w-md">
            {text}{dots}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Consulting the Oracle</p>
    </div>
  );
};

// --- DATA: REFINED QUIZ QUESTIONS ---
const PERSONALITY_QUESTIONS = [
    { id: 1, text: "You've had a long, exhausting week. How do you choose to recharge?", options: ["A lively dinner or outing with friends to vent and laugh.", "Complete solitude with a book, game, or hobby.", "Exploring a new environment or city streets.", "Productive catch-up on personal projects."] },
    { id: 2, text: "When you look at a painting or a complex image, what strikes you first?", options: ["The specific details, colors, and brushstrokes.", "The overall mood, meaning, or symbolism.", "The technique and skill required to create it.", "How it makes me feel personally."] },
    { id: 3, text: "A friend comes to you with a dilemma. Your immediate instinct is to:", options: ["Offer a logical solution to fix the problem.", "Offer emotional support and validate their feelings.", "Ask questions to understand the deeper context.", "Distract them with something fun to cheer them up."] },
    { id: 4, text: "How do you handle your daily schedule?", options: ["I plan everything in advance; lists are my life.", "I have a rough idea but keep options open.", "I prefer spontaneity and adapt as I go.", "I focus on one deadline at a time, often last minute."] },
    { id: 5, text: "In a heated debate, you are more likely to:", options: ["Prioritize truth and facts, even if it hurts feelings.", "Prioritize harmony and finding common ground.", "Play devil's advocate to explore all angles.", "Withdraw to observe or avoid conflict."] },
    { id: 6, text: "You are entrusted with a leadership role. Your style is:", options: ["Visionary: Inspiring others with a big picture.", "Democratic: Ensuring everyone has a voice.", "Strategic: Focusing on efficiency and results.", "Supportive: Helping individuals grow."] },
    { id: 7, text: "You find a mysterious locked door in an old house. You:", options: ["Search for the key logically.", "Listen at the door to see what's inside.", "Break it down; obstacles are meant to be overcome.", "Leave it be; some things are hidden for a reason."] },
    { id: 8, text: "Which concept resonates with you most deeply?", options: ["Justice and Truth.", "Mercy and Connection.", "Freedom and Discovery.", "Power and Achievement."] }
];

const TEMPERAMENT_QUESTIONS = [
    { id: 1, text: "How would you describe your natural energy levels?", options: ["Consistently high and active (I rarely sit still).", "Bursts of high energy followed by low dips.", "Steady, calm, and deliberate.", "Low-key, thoughtful, and reserved."] },
    { id: 2, text: "When you walk into a room full of strangers, you usually:", options: ["Take charge or look for someone to lead.", "Start talking to people and making jokes.", "Find a quiet corner and observe.", "Wait for someone to approach me."] },
    { id: 3, text: "When faced with a sudden, unexpected problem, you:", options: ["Get angry but immediately take action to fix it.", "Feel flustered but try to stay optimistic.", "Analyze the cause deeply before acting.", "Stay calm and wait to see if it resolves itself."] },
    { id: 4, text: "How do you handle anger?", options: ["It explodes quickly but I get over it fast.", "I express it loudly but forget why I was mad later.", "I hold onto it and remember it for a long time.", "I rarely get angry; I prefer to keep the peace."] },
    { id: 5, text: "In a group project, you naturally become the:", options: ["Leader/Director (Focus on goals).", "Presenter/Cheerleader (Focus on morale).", "Researcher/Planner (Focus on details).", "Mediator/Supporter (Focus on harmony)."] },
    { id: 6, text: "Your decision-making style is:", options: ["Fast and logical.", "Fast and emotional.", "Slow and logical.", "Slow and emotional."] },
    { id: 7, text: "What motivates you most?", options: ["Achieving goals and winning.", "Having fun and being liked.", "Doing things perfectly and accurately.", "Peace, comfort, and lack of conflict."] },
    { id: 8, text: "How organized are you?", options: ["Very organized if it helps me achieve my goal.", "Disorganized; I lose things often.", "Extremely organized; everything has a place.", "Organized enough to get by, but not obsessive."] },
    { id: 9, text: "How fast do you typically walk or talk?", options: ["Fast and purposeful.", "Fast and animated.", "Moderate and thoughtful.", "Slow and relaxed."] },
    { id: 10, text: "Your greatest fear in a work setting is:", options: ["Losing control or failing.", "Being bored or unpopular.", "Making a mistake or being criticized.", "Conflict or too much pressure."] },
    { id: 11, text: "When listening to a friend's problem, you:", options: ["Interrupt with a solution.", "Empathize verbally and share a similar story.", "Listen silently and analyze the details.", "Listen patiently and offer a hug."] },
    { id: 12, text: "Which flaw do you struggle with most?", options: ["Impatience and bossiness.", "Forgetfulness and impulsiveness.", "Perfectionism and moodiness.", "Indecisiveness and passivity."] }
];

const MODULES = [
  { id: 'personality', title: 'Personality Archetype', desc: 'Uncover your cognitive core.', icon: User, color: 'purple' },
  { id: 'temperament', title: 'Temperament Matrix', desc: 'Discover your energy rhythm.', icon: Activity, color: 'cyan' },
  { id: 'ikigai', title: 'Ikigai Alignment', desc: 'Find your true purpose.', icon: Compass, color: 'pink' },
  { id: 'synthesis', title: 'Life Strategy', desc: 'Synthesize your data into a plan.', icon: Brain, color: 'emerald' },
  { id: 'identity', title: 'Sanctuary Badge', desc: 'Your digital soul and nickname.', icon: Shield, color: 'indigo' },
  { id: 'mentors', title: 'Mentorship', desc: 'Connect with guided wisdom.', icon: MessageCircle, color: 'blue' },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({
    archetype: null, temperament: null, ikigai: null, synthesis: null,
    age: '', region: '', religion: '', principles: '', likes: '', dislikes: '', nickname: ''
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Results');
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [oracleReflection, setOracleReflection] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: any;
    const initData = async (uid: string) => {
        setUserId(uid);
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                setUserData(prev => ({ ...prev, ...profile }));
                if (profile.archetype || profile.temperament) {
                    fetchOracle(profile);
                }
            }
        } catch (e) { console.error("Dashboard fetch error", e); }
    };

    const initMentors = async () => {
        setLoadingMentors(true);
        try {
            const data = await fetchMentors();
            setMentors(data);
        } catch (e) { console.error("Failed to load mentors", e); }
        finally { setLoadingMentors(false); }
    };

    if (auth) {
        unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) { initData(user.uid); initMentors(); }
            else { navigate('/login'); }
        });
    } else {
        const localUser = localStorage.getItem('eunoia_user');
        if (localUser) { initData(JSON.parse(localUser).uid); initMentors(); }
        else { navigate('/login'); }
    }
    return () => unsubscribe?.();
  }, [navigate]);

  const fetchOracle = async (profile: any) => {
      const res = await getDailyOracleReflection(profile);
      if (res.success) setOracleReflection(res.data);
  };

  const clearError = () => setError(null);

  const saveProgress = async (newData: any) => {
      if (userId) await saveUserProgress(userId, newData);
  };

  const handlePersonalityComplete = async (answers: string[], extraText: string) => {
    setLoading(true); setLoadingMessage('Analyzing Archetypes'); clearError();
    const quizSummary = answers.map((a, i) => `Q${i+1}: ${a}`).join('; ');
    const res = await analyzePersonality(quizSummary, extraText);
    if (res.success && res.data) {
        const updated = { ...userData, archetype: res.data };
        setUserData(updated);
        await saveProgress({ archetype: res.data });
        fetchOracle(updated);
    } else setError(res.error || "Analysis failed.");
    setLoading(false);
  };

  const handleTemperamentComplete = async (answers: string[], extraText: string) => {
    setLoading(true); setLoadingMessage('Calculating Energy Matrix'); clearError();
    const quizSummary = answers.map((a, i) => `Q${i+1}: ${a}`).join('; ');
    const res = await analyzeTemperament(quizSummary, extraText);
    if (res.success && res.data) {
        const updated = { ...userData, temperament: res.data };
        setUserData(updated);
        await saveProgress({ temperament: res.data });
        fetchOracle(updated);
    } else setError(res.error || "Analysis failed.");
    setLoading(false);
  };

  const handleIkigaiComplete = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    setLoading(true); setLoadingMessage('Aligning Purpose'); clearError();
    const res = await generateIkigaiInsight(love, goodAt, worldNeeds, paidFor);
    if (res.success && res.data) {
        const updated = { ...userData, ikigai: res.data };
        setUserData(updated);
        await saveProgress({ ikigai: res.data });
    } else setError(res.error || "Alignment failed.");
    setLoading(false);
  };

  const handleSynthesisComplete = async (formData: any) => {
    setLoading(true); setLoadingMessage('Drafting Life Strategy'); clearError();
    const res = await generateLifeSynthesis({ ...formData, ...userData });
    if (res.success && res.data) {
        const updated = { ...userData, ...formData, synthesis: res.data };
        setUserData(updated);
        await saveProgress({ ...formData, synthesis: res.data });
    } else setError(res.error || "Synthesis failed.");
    setLoading(false);
  };

  const handleGenerateNickname = async () => {
    setLoading(true); setLoadingMessage('Divining True Name'); clearError();
    const nick = await generateNickname(`${userData.archetype?.archetype || 'Seeker'} ${userData.temperament?.temperament || ''}`);
    setUserData({ ...userData, nickname: nick });
    await saveProgress({ nickname: nick });
    setLoading(false);
  };

  const isLocked = (id: string) => {
      switch(id) {
          case 'personality': return false;
          case 'temperament': return !userData.archetype;
          case 'ikigai': return !userData.temperament;
          case 'synthesis': return !userData.ikigai;
          case 'identity': return false; 
          case 'mentors': return false; 
          default: return true;
      }
  };

  const isCompleted = (id: string) => {
      switch(id) {
          case 'personality': return !!userData.archetype;
          case 'temperament': return !!userData.temperament;
          case 'ikigai': return !!userData.ikigai;
          case 'synthesis': return !!userData.synthesis;
          case 'identity': return !!userData.nickname;
          default: return false;
      }
  };

  const renderHub = () => {
      const completedCount = MODULES.filter(m => isCompleted(m.id)).length;
      const progress = (completedCount / (MODULES.length - 1)) * 100;

      return (
        <div className="animate-fade-in space-y-8">
            {oracleReflection && (
                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-8 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-2 flex items-center gap-2">
                            <Quote className="w-3 h-3" /> The Sanctuary Oracle
                        </div>
                        <h3 className="text-2xl md:text-3xl font-serif text-white mb-4 leading-tight italic">"{oracleReflection.quote}"</h3>
                        <div className="flex gap-4 items-center">
                            <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-cyan-300 font-bold uppercase tracking-widest border border-cyan-500/30">
                                Focus: {oracleReflection.focus}
                            </div>
                            <div className="text-sm text-gray-400 font-medium font-serif">
                                — {oracleReflection.affirmation}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">The Chambers</h2>
                    <p className="text-gray-600 dark:text-gray-400">Unlock the secrets of your inner universe.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Profile Completion: {Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULES.map((module) => {
                    const locked = isLocked(module.id);
                    const completed = isCompleted(module.id);
                    return (
                        <div 
                            key={module.id}
                            onClick={() => !locked && setActiveModule(module.id)}
                            className={`
                                relative p-6 rounded-3xl border transition-all duration-300 overflow-hidden group
                                ${locked 
                                    ? 'bg-gray-100 dark:bg-black/40 border-gray-200 dark:border-white/5 opacity-70 cursor-not-allowed' 
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-purple-500/50'
                                }
                            `}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${locked ? 'bg-gray-200 dark:bg-white/5 text-gray-400' : `bg-${module.color}-100 dark:bg-${module.color}-900/30 text-${module.color}-600 dark:text-${module.color}-400`}`}>
                                        <module.icon className="w-6 h-6" />
                                    </div>
                                    {locked ? <Lock className="w-5 h-5 text-gray-400" /> : completed ? <Check className="w-5 h-5 text-green-500" /> : <Play className="w-5 h-5 fill-current text-purple-500 animate-pulse" />}
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${locked ? 'text-gray-500' : 'text-gray-900 dark:text-white font-serif'}`}>{module.title}</h3>
                                <p className={`text-sm mb-6 ${locked ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>{module.desc}</p>
                                <div className="flex items-center text-sm font-bold">
                                    {locked ? <span className="text-gray-400">Locked</span> : <span className={`text-${module.color}-600 dark:text-${module.color}-400 flex items-center gap-1`}>{completed ? 'View Analysis' : 'Begin Module'} <ChevronRight className="w-4 h-4" /></span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      );
  };

  const renderActiveModule = () => {
      if (!activeModule) return null;
      if (loading) return <DynamicLoader text={loadingMessage} />;

      const handleBack = () => { setActiveModule(null); clearError(); };
      
      return (
          <div className="animate-fade-in pb-12">
              <button onClick={handleBack} className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors uppercase tracking-widest">
                  <ArrowLeft className="w-4 h-4" /> Back to Sanctuary
              </button>
              
              {activeModule === 'personality' && (
                  <>
                      {!userData.archetype ? (
                          !quizStarted ? <ReadinessView onStart={() => setQuizStarted(true)} /> : 
                          <QuizView title="Personality Archetype" description="Discover your cognitive core." questions={PERSONALITY_QUESTIONS} onComplete={handlePersonalityComplete} color="purple" icon={<User className="w-8 h-8 text-purple-600" />} />
                      ) : <ComprehensiveResultView title="Archetype Analysis" data={userData.archetype} type="personality" color="purple" onNext={handleBack} btnText="Return to Hub" />}
                  </>
              )}

              {activeModule === 'temperament' && (
                  <>
                      {!userData.temperament ? <QuizView title="Temperament Matrix" description="Discover your energy rhythm." questions={TEMPERAMENT_QUESTIONS} onComplete={handleTemperamentComplete} color="cyan" icon={<Activity className="w-8 h-8 text-cyan-600" />} /> : 
                      <ComprehensiveResultView title="Temperament Analysis" data={userData.temperament} type="temperament" color="cyan" onNext={handleBack} btnText="Return to Hub" />}
                  </>
              )}

              {activeModule === 'ikigai' && (
                  <>
                     {!userData.ikigai ? <IkigaiForm onSubmit={handleIkigaiComplete} /> : 
                     <ComprehensiveResultView title="Career & Purpose Map" data={userData.ikigai} type="ikigai" color="pink" onNext={handleBack} btnText="Return to Hub" />}
                  </>
              )}

              {activeModule === 'synthesis' && (
                  <>
                    {!userData.synthesis ? <SynthesisForm onSubmit={handleSynthesisComplete} defaultData={userData} /> : 
                    <SynthesisResultView data={userData.synthesis} onBack={handleBack} />}
                  </>
              )}

              {activeModule === 'identity' && (
                   <div className="flex flex-col items-center space-y-8 py-8">
                        {!userData.nickname ? (
                            <div className="text-center">
                                <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-serif">Sanctuary Identity</h2>
                                <p className="text-gray-500 mb-6">Receive your mystical name and badge.</p>
                                <button onClick={handleGenerateNickname} className="btn-primary">Reveal Identity</button>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center gap-6">
                                <BadgeSVG data={userData} />
                                <div className="flex gap-4">
                                    <button onClick={() => alert("Identity badge archived.")} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center gap-2 transition-transform hover:scale-105"><Download className="w-4 h-4" /> Export Badge</button>
                                    <button onClick={handleBack} className="px-6 py-3 border border-gray-300 dark:border-white/20 rounded-xl font-bold transition-transform hover:scale-105">Return</button>
                                </div>
                            </div>
                        )}
                   </div>
              )}

              {activeModule === 'mentors' && <MentorsView mentors={mentors} loading={loadingMentors} onBack={handleBack} />}
          </div>
      );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto">
        {!activeModule && (
            <div className="mb-12 text-center animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 font-serif">The Sanctuary</h1>
                <p className="text-gray-500 dark:text-gray-400">Discover the depths of your potential.</p>
            </div>
        )}
        <div className={`bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl min-h-[500px] transition-all duration-500 ${activeModule ? 'max-w-4xl mx-auto' : 'w-full'}`}>
            {error && <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 rounded-xl flex gap-3 animate-fade-in items-center"><AlertTriangle className="w-5 h-5 text-red-600" /><p className="text-sm text-red-700 font-medium">{error}</p></div>}
            {activeModule ? renderActiveModule() : renderHub()}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ReadinessView = ({ onStart }: any) => (
    <div className="text-center py-12 space-y-8 animate-fade-in">
        <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
            <Sparkles className="w-16 h-16 text-purple-600 mx-auto relative z-10"/>
        </div>
        <div>
            <h2 className="text-3xl font-serif font-bold mb-4 text-gray-900 dark:text-white">Prepare Your Mind</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Take a deep breath. Find a quiet space. The Oracle requires honesty to reveal your true form.
            </p>
        </div>
        <button onClick={onStart} className="px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-purple-500/20">
            Begin Assessment
        </button>
    </div>
);

const QuizView = ({ questions, onComplete, color, icon }: any) => {
    const [idx, setIdx] = useState(0);
    const [ans, setAns] = useState<string[]>([]);
    
    const sel = (o: string) => { 
        const n = [...ans, o]; 
        setAns(n); 
        if (idx < questions.length - 1) {
            setIdx(idx + 1);
        } else {
            onComplete(n, '');
        } 
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>{icon}</div>
                    <h3 className="text-xl font-bold font-serif">Assessment Step {idx+1} of {questions.length}</h3>
                </div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{Math.round(((idx+1)/questions.length)*100)}%</div>
            </div>
            <div className="bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all duration-500`} style={{width: `${((idx+1)/questions.length)*100}%`}}></div>
            </div>
            
            <div className="space-y-6">
                <h4 className="text-2xl font-serif text-gray-900 dark:text-white leading-relaxed">{questions[idx].text}</h4>
                <div className="grid gap-3">
                    {questions[idx].options.map((o:any) => (
                        <button 
                            key={o} 
                            onClick={() => sel(o)} 
                            className="w-full p-5 text-left border border-gray-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-500/50 transition-all group flex justify-between items-center"
                        >
                            <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">{o}</span>
                            <ArrowIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ComprehensiveResultView = ({ title, data, color, onNext, btnText }: any) => (
    <div className="animate-fade-in space-y-10 max-w-3xl mx-auto">
        <div className="text-center pb-8 border-b border-gray-200 dark:border-white/10">
            <div className={`px-4 py-1 inline-block bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 rounded-full text-xs font-bold mb-6 uppercase tracking-widest border border-${color}-500/20`}>{title}</div>
            <h3 className="text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4 leading-tight">{data.archetype || data.temperament || data.title}</h3>
            <p className="italic text-xl text-gray-500 font-serif">"{data.tagline || data.element || 'Your Core Essence'}"</p>
        </div>
        
        <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
            <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-200 font-medium italic mb-2">The Oracle's Synthesis:</p>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{data.description || data.insight}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-3xl">
                <h4 className="font-bold mb-4 flex gap-2 text-emerald-700 dark:text-emerald-400 uppercase text-xs tracking-widest"><Sparkles className="w-4 h-4"/> Key Strengths</h4>
                <ul className="space-y-3">
                    {data.strengths?.map((s: string) => <li key={s} className="flex gap-2 text-gray-700 dark:text-gray-200 text-sm"><Check className="w-4 h-4 text-emerald-500 shrink-0"/> {s}</li>)}
                </ul>
            </div>
            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-3xl">
                <h4 className="font-bold mb-4 flex gap-2 text-red-700 dark:text-red-400 uppercase text-xs tracking-widest"><Minus className="w-4 h-4"/> Critical Weaknesses</h4>
                <ul className="space-y-3">
                    {(data.shadowSide || data.stressTriggers || data.skillsToDevelop)?.map((s: string) => <li key={s} className="flex gap-2 text-gray-700 dark:text-gray-200 text-sm"><AlertTriangle className="w-4 h-4 text-red-500 shrink-0"/> {s}</li>)}
                </ul>
            </div>
        </div>

        <div className="p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl">
             <h4 className="font-bold mb-4 flex gap-2 text-purple-600 dark:text-purple-400 uppercase text-xs tracking-widest"><Target className="w-4 h-4"/> Moving Ahead</h4>
             <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">"{data.growthKey || data.rechargeStrategy || data.actionableStep}"</p>
        </div>

        <button onClick={onNext} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl">
            {btnText}
        </button>
    </div>
);

const IkigaiForm = ({ onSubmit }: any) => {
    const [f, setF] = useState({ love: '', goodAt: '', worldNeeds: '', paidFor: '' });
    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h3 className="text-3xl font-serif font-bold">The Ikigai Compass</h3>
                <p className="text-gray-500">Mapping the intersection of your life's pillars.</p>
            </div>
            <div className="grid gap-6">
                {[
                    { id: 'love', label: 'What you Love', color: 'pink', placeholder: 'e.g. Creating art, solving puzzles, caring for animals...' },
                    { id: 'goodAt', label: 'What you are Good At', color: 'emerald', placeholder: 'e.g. Public speaking, coding, empathy, strategy...' },
                    { id: 'worldNeeds', label: 'What the World Needs', color: 'cyan', placeholder: 'e.g. Sustainable tech, mental health support, clean energy...' },
                    { id: 'paidFor', label: 'What you can be Paid For', color: 'indigo', placeholder: 'e.g. Consulting, design, healthcare, teaching...' }
                ].map(item => (
                    <div key={item.id} className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-widest text-${item.color}-600`}>{item.label}</label>
                        <textarea 
                            value={(f as any)[item.id]}
                            onChange={e => setF({...f, [item.id]: e.target.value})}
                            placeholder={item.placeholder}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none h-24"
                        />
                    </div>
                ))}
            </div>
            <button 
                onClick={() => onSubmit(f.love, f.goodAt, f.worldNeeds, f.paidFor)}
                disabled={!f.love || !f.goodAt}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg disabled:opacity-50"
            >
                Calculate My Purpose
            </button>
        </div>
    );
};

const SynthesisForm = ({ onSubmit, defaultData }: any) => {
    const [f, setF] = useState({ age: defaultData.age || '', principles: defaultData.principles || '', likes: defaultData.likes || '', dislikes: defaultData.dislikes || '' });
    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h3 className="text-3xl font-serif font-bold">The Master Synthesis</h3>
                <p className="text-gray-500">The final step. Merging all archives into one strategy.</p>
            </div>
            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Chronological Age</label>
                        <input value={f.age} onChange={e => setF({...f, age: e.target.value})} placeholder="Years..." className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Core Values/Principles</label>
                        <input value={f.principles} onChange={e => setF({...f, principles: e.target.value})} placeholder="e.g. Freedom, Honor, Truth..." className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Life Preferences (Likes)</label>
                    <textarea value={f.likes} onChange={e => setF({...f, likes: e.target.value})} placeholder="What makes your life feel worth living?" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl h-24 resize-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Life Friction (Dislikes)</label>
                    <textarea value={f.dislikes} onChange={e => setF({...f, dislikes: e.target.value})} placeholder="What drains your spirit or causes stress?" className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl h-24 resize-none" />
                </div>
            </div>
            <button 
                onClick={() => onSubmit(f)}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
            >
                <Sparkles className="w-5 h-5" /> Generate Master Roadmap
            </button>
        </div>
    );
};

const SynthesisResultView = ({ data, onBack }: any) => (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
        <div className="text-center space-y-6">
            <h3 className="text-5xl font-serif font-bold text-gray-900 dark:text-white">Your Path Ahead</h3>
            <div className="relative inline-block group">
                 <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                 <div className="relative p-8 bg-indigo-900 rounded-3xl text-white shadow-2xl italic text-2xl md:text-3xl font-serif border border-white/20">
                    "{data.mantra}"
                 </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Core Career', value: data.careerPath, icon: Briefcase, color: 'purple' },
                { label: 'To Stop', value: data.stopDoing, icon: X, color: 'red' },
                { label: 'To Start', value: data.startDoing, icon: Check, color: 'emerald' },
                { label: 'Daily Anchor', value: data.dailyRoutine[0], icon: Clock, color: 'indigo' }
            ].map(item => (
                <div key={item.label} className="p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl">
                    <item.icon className={`w-5 h-5 text-${item.color}-500 mb-3`} />
                    <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">{item.label}</h4>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                </div>
            ))}
        </div>

        <div className="p-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl space-y-4">
             <h4 className="text-xl font-serif font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" /> Strategic Alignment
             </h4>
             <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300 italic">"{data.interactionDepth}"</p>
             <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">{data.leverageStrategy}</p>
             </div>
        </div>

        {/* Roadmap Visualization */}
        <div className="space-y-8">
            <h3 className="text-2xl font-serif font-bold flex items-center gap-2"><Map className="w-6 h-6 text-cyan-500"/> The Chronological Roadmap</h3>
            <div className="grid md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-100 dark:bg-white/5 -z-10"></div>
                {data.roadmap?.map((phase: any, i: number) => (
                    <div key={i} className="space-y-4">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full flex items-center justify-center text-purple-500 font-bold mb-4 shadow-lg">{i + 1}</div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-500">{phase.phase}</h4>
                            <h5 className="text-lg font-bold font-serif mb-2">{phase.goal}</h5>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                            <ul className="space-y-2">
                                {phase.actions.map((act: string) => (
                                    <li key={act} className="flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        <TrendingUp className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                                        {act}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
            <button onClick={() => alert("Roadmap Exported.")} className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> Export My Sanctuary Strategy
            </button>
            <button onClick={onBack} className="px-12 py-5 border border-gray-300 dark:border-white/20 rounded-2xl font-bold">Return to Hub</button>
        </div>
    </div>
);

const MentorsView = ({ mentors, loading, onBack }: any) => (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <div className="text-center space-y-2">
            <h3 className="text-3xl font-serif font-bold">Sanctuary Mentors</h3>
            <p className="text-gray-500">Guides curated for your specific psychological profile.</p>
        </div>
        {loading ? (
            <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin text-purple-600 w-12 h-12 mb-4"/><p className="text-gray-500">Retrieving Guides...</p></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentors.map((m: any) => (
                    <div key={m.id} className="p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl flex items-center gap-6 group hover:border-purple-500/50 transition-colors">
                        <img src={m.imageUrl} className="w-20 h-20 rounded-2xl object-cover group-hover:scale-105 transition-transform" />
                        <div className="flex-1">
                            <h4 className="font-bold text-lg font-serif">{m.name}</h4>
                            <p className="text-xs text-purple-500 font-bold uppercase tracking-widest mb-2">{m.specialization}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{m.bio || "No biography provided."}</p>
                        </div>
                        <button className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl hover:bg-purple-600 hover:text-white transition-colors"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
        )}
        <div className="flex justify-center">
            <button onClick={onBack} className="btn-primary px-12 py-4">Return to Sanctuary Hub</button>
        </div>
    </div>
);

const BadgeSVG = ({ data }: any) => (
    <div className="perspective-1000 group">
        <div className="w-[320px] h-[440px] rounded-[40px] bg-indigo-950 shadow-2xl border border-white/20 p-8 flex flex-col items-center text-center text-white relative overflow-hidden transform transition-all duration-500 group-hover:rotate-y-12">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-950 to-black opacity-80"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div>
                    <div className="text-[10px] tracking-[0.5em] font-serif opacity-50 mb-10">EUNOIA SANCTUARY</div>
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/20">
                        <span className="text-4xl font-serif">{data.nickname?.[0] || 'S'}</span>
                    </div>
                    <h4 className="text-2xl font-serif font-bold mb-1 tracking-tight">{data.nickname}</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-purple-400 mb-6">{data.archetype?.archetype || 'Seeker'}</p>
                </div>

                <div className="w-full space-y-3 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60">
                        <span>Energy Matrix</span>
                        <span className="font-bold text-cyan-400">{data.temperament?.temperament || 'Pending'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60">
                        <span>Initiated</span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60">
                        <span>Profile Status</span>
                        <span className="text-emerald-400">Verified</span>
                    </div>
                </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
    </div>
);

export default DashboardPage;
