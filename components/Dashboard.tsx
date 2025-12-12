import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Brain, Compass, Shield, Download, 
  MessageCircle, Activity, ChevronRight, CheckCircle2, Lock, ArrowLeft, Star, AlertTriangle, Lightbulb, Flame, Droplets, Wind, Mountain,
  Heart, Briefcase, Home, Zap, Layers, Target, Clock, BookOpen, Fingerprint, RefreshCcw, Loader2, Sparkles, ArrowRight as ArrowIcon, X,
  Quote, Sun, Play, Check, Moon, Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebaseConfig';
import { analyzePersonality, analyzeTemperament, generateLifeSynthesis, generateNickname, generateIkigaiInsight } from '../services/geminiService';
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
    {
        id: 1,
        text: "You've had a long, exhausting week. How do you choose to recharge?",
        options: [
            "A lively dinner or outing with friends to vent and laugh.",
            "Complete solitude with a book, game, or hobby.",
            "Exploring a new environment or city streets.",
            "Productive catch-up on personal projects."
        ]
    },
    {
        id: 2,
        text: "When you look at a painting or a complex image, what strikes you first?",
        options: [
            "The specific details, colors, and brushstrokes.",
            "The overall mood, meaning, or symbolism.",
            "The technique and skill required to create it.",
            "How it makes me feel personally."
        ]
    },
    {
        id: 3,
        text: "A friend comes to you with a dilemma. Your immediate instinct is to:",
        options: [
            "Offer a logical solution to fix the problem.",
            "Offer emotional support and validate their feelings.",
            "Ask questions to understand the deeper context.",
            "Distract them with something fun to cheer them up."
        ]
    },
    {
        id: 4,
        text: "How do you handle your daily schedule?",
        options: [
            "I plan everything in advance; lists are my life.",
            "I have a rough idea but keep options open.",
            "I prefer spontaneity and adapt as I go.",
            "I focus on one deadline at a time, often last minute."
        ]
    },
    {
        id: 5,
        text: "In a heated debate, you are more likely to:",
        options: [
            "Prioritize truth and facts, even if it hurts feelings.",
            "Prioritize harmony and finding common ground.",
            "Play devil's advocate to explore all angles.",
            "Withdraw to observe or avoid conflict."
        ]
    },
    {
        id: 6,
        text: "You are entrusted with a leadership role. Your style is:",
        options: [
            "Visionary: Inspiring others with a big picture.",
            "Democratic: Ensuring everyone has a voice.",
            "Strategic: Focusing on efficiency and results.",
            "Supportive: Helping individuals grow."
        ]
    },
    {
        id: 7,
        text: "You find a mysterious locked door in an old house. You:",
        options: [
            "Search for the key logically.",
            "Listen at the door to see what's inside.",
            "Break it down; obstacles are meant to be overcome.",
            "Leave it be; some things are hidden for a reason."
        ]
    },
    {
        id: 8,
        text: "Which concept resonates with you most deeply?",
        options: [
            "Justice and Truth.",
            "Mercy and Connection.",
            "Freedom and Discovery.",
            "Power and Achievement."
        ]
    }
];

const TEMPERAMENT_QUESTIONS = [
    {
        id: 1,
        text: "How would you describe your natural energy levels?",
        options: [
            "Consistently high and active (I rarely sit still).",
            "Bursts of high energy followed by low dips.",
            "Steady, calm, and deliberate.",
            "Low-key, thoughtful, and reserved."
        ]
    },
    {
        id: 2,
        text: "When you walk into a room full of strangers, you usually:",
        options: [
            "Take charge or look for someone to lead.",
            "Start talking to people and making jokes.",
            "Find a quiet corner and observe.",
            "Wait for someone to approach me."
        ]
    },
    {
        id: 3,
        text: "When faced with a sudden, unexpected problem, you:",
        options: [
            "Get angry but immediately take action to fix it.",
            "Feel flustered but try to stay optimistic.",
            "Analyze the cause deeply before acting.",
            "Stay calm and wait to see if it resolves itself."
        ]
    },
    {
        id: 4,
        text: "How do you handle anger?",
        options: [
            "It explodes quickly but I get over it fast.",
            "I express it loudly but forget why I was mad later.",
            "I hold onto it and remember it for a long time.",
            "I rarely get angry; I prefer to keep the peace."
        ]
    },
    {
        id: 5,
        text: "In a group project, you naturally become the:",
        options: [
            "Leader/Director (Focus on goals).",
            "Presenter/Cheerleader (Focus on morale).",
            "Researcher/Planner (Focus on details).",
            "Mediator/Supporter (Focus on harmony)."
        ]
    },
    {
        id: 6,
        text: "Your decision-making style is:",
        options: [
            "Fast and logical.",
            "Fast and emotional.",
            "Slow and logical.",
            "Slow and emotional."
        ]
    },
    {
        id: 7,
        text: "What motivates you most?",
        options: [
            "Achieving goals and winning.",
            "Having fun and being liked.",
            "Doing things perfectly and accurately.",
            "Peace, comfort, and lack of conflict."
        ]
    },
    {
        id: 8,
        text: "How organized are you?",
        options: [
            "Very organized if it helps me achieve my goal.",
            "Disorganized; I lose things often.",
            "Extremely organized; everything has a place.",
            "Organized enough to get by, but not obsessive."
        ]
    },
    {
        id: 9,
        text: "How fast do you typically walk or talk?",
        options: [
            "Fast and purposeful.",
            "Fast and animated.",
            "Moderate and thoughtful.",
            "Slow and relaxed."
        ]
    },
    {
        id: 10,
        text: "Your greatest fear in a work setting is:",
        options: [
            "Losing control or failing.",
            "Being bored or unpopular.",
            "Making a mistake or being criticized.",
            "Conflict or too much pressure."
        ]
    },
    {
        id: 11,
        text: "When listening to a friend's problem, you:",
        options: [
            "Interrupt with a solution.",
            "Empathize verbally and share a similar story.",
            "Listen silently and analyze the details.",
            "Listen patiently and offer a hug."
        ]
    },
    {
        id: 12,
        text: "Which flaw do you struggle with most?",
        options: [
            "Impatience and bossiness.",
            "Forgetfulness and impulsiveness.",
            "Perfectionism and moodiness.",
            "Indecisiveness and passivity."
        ]
    }
];

// --- MODULES CONFIG ---
const MODULES = [
  { id: 'personality', title: 'Personality Archetype', desc: 'Uncover your cognitive core and strengths.', icon: User, color: 'purple' },
  { id: 'temperament', title: 'Temperament Matrix', desc: 'Discover your energy rhythm.', icon: Activity, color: 'cyan' },
  { id: 'ikigai', title: 'Ikigai Alignment', desc: 'Find your true purpose intersection.', icon: Compass, color: 'pink' },
  { id: 'synthesis', title: 'Life Strategy', desc: 'Synthesize your data into a plan.', icon: Brain, color: 'emerald' },
  { id: 'identity', title: 'Sanctuary Badge', desc: 'Your digital soul and nickname.', icon: Shield, color: 'indigo' },
  { id: 'mentors', title: 'Mentorship', desc: 'Connect with guided wisdom.', icon: MessageCircle, color: 'blue' },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>({
    archetype: null,
    temperament: null,
    ikigai: null,
    synthesis: null,
    age: '',
    region: '',
    religion: '',
    principles: '',
    likes: '',
    dislikes: '',
    nickname: ''
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Results');
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // --- AUTH & DATA LOADING ---
  // Fix: Use onAuthStateChanged to prevent race condition where app loads before Auth is ready.
  useEffect(() => {
    let unsubscribe: any;
    
    const initData = async (uid: string) => {
        setUserId(uid);
        try {
            const profile = await getUserProfile(uid);
            if (profile) {
                setUserData(prev => ({ ...prev, ...profile }));
            }
        } catch (e) {
            console.error("Dashboard fetch error", e);
        }
    };

    const initMentors = async () => {
        setLoadingMentors(true);
        try {
            const data = await fetchMentors();
            setMentors(data);
        } catch (e) {
            console.error("Failed to load mentors", e);
        } finally {
            setLoadingMentors(false);
        }
    };

    if (auth) {
        unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                initData(user.uid);
                initMentors();
            } else {
                 // Fallback to local storage or redirect
                 const localUser = localStorage.getItem('eunoia_user');
                 if (localUser) {
                     initData(JSON.parse(localUser).uid);
                     initMentors();
                 } else {
                     navigate('/login'); 
                 }
            }
        });
    } else {
        // Mock mode (auth is null/undefined)
        const localUser = localStorage.getItem('eunoia_user');
        if (localUser) {
             initData(JSON.parse(localUser).uid);
             initMentors();
        } else {
             navigate('/login');
        }
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Loading Message Cycler
  useEffect(() => {
    if (!loading) return;
    const messages = ['Connecting to Sanctuary', 'Analyzing Patterns', 'Synthesizing Data', 'Applying Ancient Wisdom'];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  // --- Handlers ---
  const clearError = () => setError(null);

  // Helper to save to Firestore
  const saveProgress = async (newData: any) => {
      if (userId) {
          await saveUserProgress(userId, newData);
      }
  };

  const handlePersonalityComplete = async (answers: string[], extraText: string) => {
    setLoading(true);
    setLoadingMessage('Analyzing Archetypes');
    clearError();
    const quizSummary = answers.map((a, i) => `Q${i+1}: ${a}`).join('; ');
    const res = await analyzePersonality(quizSummary, extraText);
    if (res.success && res.data) {
        setUserData({ ...userData, archetype: res.data });
        await saveProgress({ archetype: res.data });
    } else {
        setError(res.error || "Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const handleTemperamentComplete = async (answers: string[], extraText: string) => {
    setLoading(true);
    setLoadingMessage('Calculating Energy Matrix');
    clearError();
    const quizSummary = answers.map((a, i) => `Q${i+1}: ${a}`).join('; ');
    const res = await analyzeTemperament(quizSummary, extraText);
    if (res.success && res.data) {
        setUserData({ ...userData, temperament: res.data });
        await saveProgress({ temperament: res.data });
    } else {
        setError(res.error || "Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const handleIkigaiComplete = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    setLoading(true);
    setLoadingMessage('Aligning Purpose');
    clearError();
    const res = await generateIkigaiInsight(love, goodAt, worldNeeds, paidFor);
    if (res.success && res.data) {
        setUserData({ ...userData, ikigai: res.data });
        await saveProgress({ ikigai: res.data });
    } else {
        setError(res.error || "Alignment failed. Please try again.");
    }
    setLoading(false);
  };

  const handleSynthesisComplete = async (formData: any) => {
    setLoading(true);
    setLoadingMessage('Drafting Life Strategy');
    clearError();
    const synthesisInput = { ...formData, ...userData }; 
    const res = await generateLifeSynthesis(synthesisInput);
    if (res.success && res.data) {
        setUserData({ ...userData, ...formData, synthesis: res.data });
        await saveProgress({ ...formData, synthesis: res.data });
    } else {
        setError(res.error || "Synthesis failed. Please try again.");
    }
    setLoading(false);
  };

  const handleGenerateNickname = async () => {
    setLoading(true);
    setLoadingMessage('Divining True Name');
    clearError();
    const context = `${userData.archetype?.archetype || 'Seeker'} ${userData.temperament?.temperament || 'Unknown'} ${userData.likes || ''}`;
    // Nickname gen returns string directly (fallback handles error internally)
    const nick = await generateNickname(context);
    setUserData({ ...userData, nickname: nick });
    await saveProgress({ nickname: nick });
    setLoading(false);
  };

  // --- Logic for Unlocking Modules ---
  const isLocked = (id: string) => {
      switch(id) {
          case 'personality': return false;
          // Unlocking other modules based on request to allow flexible access
          case 'temperament': return !userData.archetype; // Keep sequential for core data
          case 'ikigai': return !userData.temperament; // Keep sequential for core data
          case 'synthesis': return !userData.ikigai; // Synthesis needs prior data
          // REQUESTED: Unlock these modules by default
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
          case 'mentors': return false; 
          default: return false;
      }
  };

  // --- Image Generation Logic (Synchronous) ---
  const generateShareImage = (): File | null => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set high resolution (Square for socials)
    const width = 1080;
    const height = 1080; 
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#2e1065'); // Deep Purple
    grad.addColorStop(1, '#020617'); // Slate 950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i=0; i<100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fill();
    }

    // 3. Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px serif'; 
    ctx.fillText('EUNOIA', width/2, 120);
    
    ctx.fillStyle = '#d8b4fe'; // purple-300
    ctx.font = '30px sans-serif';
    ctx.fillText('THE SANCTUARY OF SELF', width/2, 170);

    // 4. Stats Bubbles
    const drawBubble = (label: string, value: string, x: number, y: number, hue: string) => {
        // Outer Glow
        const g = ctx.createRadialGradient(x, y, 50, x, y, 160);
        g.addColorStop(0, hue + '44');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 160, 0, Math.PI*2);
        ctx.fill();

        // Border
        ctx.strokeStyle = hue;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 110, 0, Math.PI*2);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(label.toUpperCase(), x, y - 30);

        // Value (Basic Wrap)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px serif';
        const words = value.split(' ');
        if(words.length > 2) {
            ctx.fillText(words.slice(0, 2).join(' '), x, y + 10);
            ctx.fillText(words.slice(2).join(' '), x, y + 50);
        } else {
            ctx.fillText(value, x, y + 20);
        }
    };

    drawBubble('Archetype', userData.archetype?.archetype || 'TBD', 250, 450, '#c084fc'); // Purple
    drawBubble('Temperament', userData.temperament?.temperament || 'TBD', 830, 450, '#22d3ee'); // Cyan
    drawBubble('Ikigai', userData.ikigai?.title || 'TBD', 540, 720, '#f472b6'); // Pink

    // 5. Mantra
    if (userData.synthesis?.mantra) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'italic 36px serif';
        const mantra = `"${userData.synthesis.mantra}"`;
        
        // Wrap mantra
        const maxWidth = 900;
        const words = mantra.split(' ');
        let y = 950;
        
        // Very basic wrap logic
        if (ctx.measureText(mantra).width > maxWidth) {
             const mid = Math.floor(words.length / 2);
             ctx.fillText(words.slice(0, mid).join(' '), width/2, y);
             ctx.fillText(words.slice(mid).join(' '), width/2, y + 50);
        } else {
             ctx.fillText(mantra, width/2, y);
        }
    } else {
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 24px sans-serif';
        ctx.fillText("Journey in progress...", width/2, 950);
    }

    try {
        const dataUrl = canvas.toDataURL('image/png');
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeString});
        return new File([blob], 'eunoia-profile.png', { type: 'image/png' });
    } catch (e) {
        console.error("Image generation failed", e);
        return null;
    }
  };

  // --- Share Functionality ---
  const handleShare = async () => {
    setShareLoading(true);
    // Generate image synchronously to preserve user gesture context
    const file = generateShareImage();
    
    if (!file) {
        setShareLoading(false);
        alert("Could not generate image.");
        return;
    }

    // Helper for downloading
    const downloadImage = (f: File) => {
        const url = URL.createObjectURL(f);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'eunoia-profile.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'My Eunoia Profile',
                text: 'Discover your inner universe.',
            });
        } catch (err: any) {
            // AbortError means user cancelled the share sheet, which is fine.
            // Other errors mean something went wrong, so fallback to download.
            if (err.name !== 'AbortError') {
                 console.warn("Share failed, falling back to download", err);
                 downloadImage(file);
            }
        }
    } else {
        // Fallback for browsers without Web Share API support (e.g. desktop Chrome)
        downloadImage(file);
    }
    setShareLoading(false);
  };

  // --- Views ---

  const renderHub = () => {
      const completedCount = MODULES.filter(m => isCompleted(m.id)).length;
      const progress = (completedCount / (MODULES.length - 1)) * 100;

      return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">Sanctuary Modules</h2>
                    <p className="text-gray-600 dark:text-gray-400">Complete each module to unlock the next step of your journey.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleShare}
                        disabled={shareLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors disabled:opacity-50"
                    >
                        {shareLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Share2 className="w-4 h-4" />}
                        {shareLoading ? 'Generating...' : 'Share Profile'}
                    </button>
                    <div className="bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Progress: {Math.round(progress)}%</span>
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
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-purple-500/50 dark:hover:border-purple-500/50'
                                }
                            `}
                        >
                            {/* Background decoration */}
                            {!locked && (
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${module.color}-500/10 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-${module.color}-500/20 transition-colors`}></div>
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${locked ? 'bg-gray-200 dark:bg-white/5 text-gray-400' : `bg-${module.color}-100 dark:bg-${module.color}-900/30 text-${module.color}-600 dark:text-${module.color}-400`}`}>
                                        <module.icon className="w-6 h-6" />
                                    </div>
                                    {locked ? (
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    ) : completed ? (
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-1 rounded-full animate-pulse">
                                            <Play className="w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className={`text-xl font-bold mb-2 ${locked ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{module.title}</h3>
                                <p className={`text-sm mb-6 ${locked ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>{module.desc}</p>
                                
                                <div className="flex items-center text-sm font-bold">
                                    {locked ? (
                                        <span className="text-gray-400">Locked</span>
                                    ) : completed ? (
                                        <span className={`text-${module.color}-600 dark:text-${module.color}-400 flex items-center gap-1`}>
                                            View Analysis <ChevronRight className="w-4 h-4" />
                                        </span>
                                    ) : (
                                        <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                            Begin Module <ChevronRight className="w-4 h-4" />
                                        </span>
                                    )}
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

      const handleBack = () => {
          setActiveModule(null);
          clearError();
      };

      const moduleConfig = MODULES.find(m => m.id === activeModule);

      return (
          <div className="animate-fade-in">
              <button 
                onClick={handleBack}
                className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to Sanctuary
              </button>

              {/* MODULE CONTENT SWITCHER */}
              
              {/* 1. PERSONALITY */}
              {activeModule === 'personality' && (
                  <>
                      {!userData.archetype ? (
                          !quizStarted ? (
                              <ReadinessView onStart={() => setQuizStarted(true)} />
                          ) : (
                              <QuizView 
                                  title="Personality Archetype"
                                  description="Answer honestly to reveal the core character of your psyche."
                                  questions={PERSONALITY_QUESTIONS}
                                  onComplete={handlePersonalityComplete}
                                  loading={loading}
                                  loadingMessage={loadingMessage}
                                  color="purple"
                                  icon={<User className="w-8 h-8 text-purple-600" />}
                              />
                          )
                      ) : (
                          <ComprehensiveResultView
                              title="Archetype Analysis"
                              data={userData.archetype}
                              type="personality"
                              color="purple"
                              onNext={handleBack}
                              btnText="Return to Hub"
                          />
                      )}
                  </>
              )}

              {/* 2. TEMPERAMENT */}
              {activeModule === 'temperament' && (
                  <>
                      {!userData.temperament ? (
                        <QuizView 
                            title="Temperament Matrix"
                            description="Answer 12 psychological triggers to determine your biological energy rhythm."
                            questions={TEMPERAMENT_QUESTIONS}
                            onComplete={handleTemperamentComplete}
                            loading={loading}
                            loadingMessage={loadingMessage}
                            color="cyan"
                            icon={<Activity className="w-8 h-8 text-cyan-600" />}
                        />
                    ) : (
                        <ComprehensiveResultView
                            title="Temperament Analysis"
                            data={userData.temperament}
                            type="temperament"
                            color="cyan"
                            onNext={handleBack}
                            btnText="Return to Hub"
                        />
                    )}
                  </>
              )}

              {/* 3. IKIGAI */}
              {activeModule === 'ikigai' && (
                  <>
                     {!userData.ikigai ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Compass className="w-8 h-8 text-pink-600" />
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Ikigai Alignment</h2>
                                    <p className="text-sm text-gray-500">Find the intersection of the 4 circles of purpose.</p>
                                </div>
                            </div>
                            <IkigaiForm onSubmit={handleIkigaiComplete} loading={loading} loadingMessage={loadingMessage} />
                        </div>
                    ) : (
                        <ComprehensiveResultView
                            title="Career & Purpose Map"
                            data={userData.ikigai}
                            type="ikigai"
                            color="pink"
                            onNext={handleBack}
                            btnText="Return to Hub"
                        />
                    )}
                  </>
              )}

              {/* 4. SYNTHESIS (UPDATED RICH VIEW) */}
              {activeModule === 'synthesis' && (
                  <>
                    {!userData.synthesis ? (
                         <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Brain className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Grand Synthesis</h2>
                                    <p className="text-sm text-gray-500">Synthesize your archetype, temperament, and ikigai into a life strategy.</p>
                                </div>
                            </div>
                            <SynthesisForm 
                                loading={loading}
                                loadingMessage={loadingMessage}
                                onSubmit={handleSynthesisComplete} 
                                defaultData={userData}
                            />
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                             <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest shadow-sm">
                                    <Brain className="w-4 h-4" /> Life Strategy
                                </div>
                                <h3 className="text-4xl md:text-6xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">The Synthesis</h3>
                                <div className="p-8 bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl text-white shadow-lg relative overflow-hidden inline-block max-w-4xl w-full text-left">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                    <div className="text-xs uppercase tracking-widest opacity-70 mb-2 font-bold">Your Mantra</div>
                                    <div className="text-3xl font-serif italic leading-relaxed">"{userData.synthesis.mantra}"</div>
                                </div>
                            </div>

                             {/* Interaction & Depth */}
                             <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Layers className="w-5 h-5 text-purple-500" /> The Synergistic Core
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8">
                                    {userData.synthesis.interactionDepth || userData.synthesis.strengthAnalysis}
                                </p>
                                
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                                    <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Strategic Leverage
                                    </h4>
                                    <p className="text-gray-800 dark:text-gray-200 italic font-medium">
                                        "{userData.synthesis.leverageStrategy}"
                                    </p>
                                </div>
                             </div>

                             {/* Career & Blindspot Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="text-blue-600 font-bold text-sm mb-3 uppercase flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Recommended Career Path
                                    </div>
                                    <div className="text-gray-900 dark:text-gray-100 text-lg font-medium">
                                        {userData.synthesis.careerPath || "Not generated"}
                                    </div>
                                </div>
                                <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <div className="text-red-600 font-bold text-sm mb-3 uppercase flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Critical Blindspot
                                    </div>
                                    <div className="text-gray-900 dark:text-gray-100 text-lg font-medium">
                                        {userData.synthesis.blindSpot}
                                    </div>
                                </div>
                             </div>

                             {/* Habits Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <div className="text-red-600 font-bold text-sm mb-2 uppercase flex items-center gap-2">
                                        <X className="w-4 h-4" /> Stop Doing
                                    </div>
                                    <div className="text-gray-900 dark:text-gray-100 text-lg">{userData.synthesis.stopDoing}</div>
                                </div>
                                <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                                    <div className="text-green-600 font-bold text-sm mb-2 uppercase flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Start Doing
                                    </div>
                                    <div className="text-gray-900 dark:text-gray-100 text-lg">{userData.synthesis.startDoing}</div>
                                </div>
                             </div>

                             {/* Schedule & Routine Section */}
                             <div className="bg-gray-50 dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                                <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Clock className="w-5 h-5 text-cyan-500" /> Optimized Daily Protocol
                                </h3>
                                
                                <div className="space-y-8 relative pl-4 md:pl-0">
                                    {/* Vertical Line for Desktop */}
                                    <div className="hidden md:block absolute left-[150px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                                     {/* Morning */}
                                     <div className="flex flex-col md:flex-row gap-4 md:gap-12 relative">
                                         <div className="md:w-[150px] flex items-center md:justify-end gap-3 text-right">
                                             <div className="md:hidden w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-500"><Sun className="w-4 h-4"/></div>
                                             <div className="hidden md:block font-bold text-orange-500 uppercase tracking-widest text-xs">Morning</div>
                                             <div className="hidden md:flex absolute left-[142px] w-4 h-4 bg-orange-500 rounded-full border-4 border-white dark:border-black"></div>
                                         </div>
                                         <div className="flex-1 bg-white dark:bg-black/20 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                                             <div className="md:hidden font-bold text-orange-500 uppercase tracking-widest text-xs mb-2">Morning</div>
                                             <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{userData.synthesis.optimalSchedule?.morning}</h4>
                                             <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-3 rounded-lg flex items-start gap-2">
                                                 <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/> 
                                                 <span>Routine: {userData.synthesis.dailyRoutine?.[0]}</span>
                                             </div>
                                         </div>
                                     </div>
                                     
                                     {/* Afternoon */}
                                     <div className="flex flex-col md:flex-row gap-4 md:gap-12 relative">
                                         <div className="md:w-[150px] flex items-center md:justify-end gap-3 text-right">
                                             <div className="md:hidden w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500"><Zap className="w-4 h-4"/></div>
                                             <div className="hidden md:block font-bold text-blue-500 uppercase tracking-widest text-xs">Afternoon</div>
                                             <div className="hidden md:flex absolute left-[142px] w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-black"></div>
                                         </div>
                                         <div className="flex-1 bg-white dark:bg-black/20 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                                             <div className="md:hidden font-bold text-blue-500 uppercase tracking-widest text-xs mb-2">Afternoon</div>
                                             <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{userData.synthesis.optimalSchedule?.afternoon}</h4>
                                             <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-3 rounded-lg flex items-start gap-2">
                                                 <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/> 
                                                 <span>Routine: {userData.synthesis.dailyRoutine?.[1]}</span>
                                             </div>
                                         </div>
                                     </div>

                                     {/* Evening */}
                                     <div className="flex flex-col md:flex-row gap-4 md:gap-12 relative">
                                         <div className="md:w-[150px] flex items-center md:justify-end gap-3 text-right">
                                             <div className="md:hidden w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500"><Moon className="w-4 h-4"/></div>
                                             <div className="hidden md:block font-bold text-indigo-500 uppercase tracking-widest text-xs">Evening</div>
                                             <div className="hidden md:flex absolute left-[142px] w-4 h-4 bg-indigo-500 rounded-full border-4 border-white dark:border-black"></div>
                                         </div>
                                         <div className="flex-1 bg-white dark:bg-black/20 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                                             <div className="md:hidden font-bold text-indigo-500 uppercase tracking-widest text-xs mb-2">Evening</div>
                                             <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{userData.synthesis.optimalSchedule?.evening}</h4>
                                             <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-3 rounded-lg flex items-start gap-2">
                                                 <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/> 
                                                 <span>Routine: {userData.synthesis.dailyRoutine?.[2]}</span>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                             </div>

                            <div className="flex justify-center pt-8">
                                <button onClick={handleBack} className="btn-primary max-w-md">
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    )}
                  </>
              )}

              {/* 5. IDENTITY */}
              {activeModule === 'identity' && (
                   <div className="flex flex-col items-center space-y-8">
                        <div className="text-center">
                             <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sanctuary Identity</h2>
                        </div>
                        
                        {!userData.nickname ? (
                            <div className="w-full max-w-md text-center">
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Receive your mystical name and badge to cement your place in the Sanctuary.</p>
                                {loading ? (
                                    <DynamicLoader text={loadingMessage} />
                                ) : (
                                    <button onClick={handleGenerateNickname} className="btn-primary">
                                        Reveal Identity
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
                                <div className="w-full max-w-[320px]">
                                    <BadgeSVG data={userData} />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={() => downloadBadge()} className="flex-1 sm:flex-none px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl flex items-center justify-center gap-2">
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                    <button onClick={handleBack} className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 dark:border-white/20 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white/10">
                                        Return to Hub
                                    </button>
                                </div>
                            </div>
                        )}
                   </div>
              )}

              {/* 6. MENTORS */}
              {activeModule === 'mentors' && (
                  <div className="space-y-6">
                       <div className="flex items-center gap-3 mb-6">
                            <MessageCircle className="w-8 h-8 text-blue-600" />
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Sanctuary Mentors</h2>
                                <p className="text-sm text-gray-500">Guides curated for your archetype.</p>
                            </div>
                        </div>

                        {loadingMentors ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : mentors.length === 0 ? (
                            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                                <p className="text-gray-500">Our mentors are currently being curated for your specific profile. Please check back soon.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mentors.map(mentor => (
                                    <div key={mentor.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-4 hover:border-purple-500 transition-colors">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img src={mentor.imageUrl} alt={mentor.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Mentor')} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{mentor.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{mentor.specialization}</p>
                                        </div>
                                        <button className="px-3 py-1.5 bg-white dark:bg-white/10 rounded-lg text-xs font-bold border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-900/20 shrink-0">
                                            Contact
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-center pt-8">
                                <button onClick={handleBack} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                    Return to Hub
                                </button>
                        </div>
                  </div>
              )}

          </div>
      );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - Only show on Hub */}
        {!activeModule && (
            <div className="mb-8 md:mb-12 text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 font-serif">Your Inner Journey</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    The Sanctuary is divided into 6 chambers. Unlock them sequentially to build your complete profile.
                </p>
            </div>
        )}

        <div className={`
            bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden transition-all duration-500
            ${activeModule ? 'max-w-4xl mx-auto' : 'w-full'}
        `}>
            
            {/* Inline Error Notification */}
            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Attention Needed</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                    <button onClick={clearError} className="text-red-500 hover:text-red-700 dark:hover:text-red-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {activeModule ? renderActiveModule() : renderHub()}

        </div>
      </div>
      <style>{`
        .btn-primary {
            width: 100%;
            padding: 1rem;
            background-color: #4c1d95; /* purple-900 roughly */
            color: white;
            font-weight: bold;
            border-radius: 0.75rem;
            transition: opacity 0.2s;
        }
        .dark .btn-primary {
            background-color: white;
            color: black;
        }
        .btn-primary:hover {
            opacity: 0.9;
        }
        /* Custom Scrollbar for steps */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ReadinessView = ({ onStart }: { onStart: () => void }) => (
  <div className="text-center space-y-8 animate-fade-in py-8">
    <div className="max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
        <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Prepare Your Mind</h2>
      <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
        To get the most accurate reflection of your inner self, we need you in the right headspace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Be Honest</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Answer as who you <em>are</em> today, not who you want to be.</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-pink-500/50 transition-colors">
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4 text-pink-600 dark:text-pink-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Trust Intuition</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Don't overthink. Your immediate instinct is usually right.</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-amber-500/50 transition-colors">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Take Your Time</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">There is no timer. Reflect before you select.</p>
        </div>
      </div>

      <button onClick={onStart} className="btn-primary text-lg px-12 py-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
        Begin Assessment
      </button>
    </div>
  </div>
);

const ComprehensiveResultView = ({ title, data, type, color, onNext, btnText }: any) => {
    // Helper to get elemental icon
    const getElementIcon = (el: string) => {
        const l = el?.toLowerCase() || '';
        if (l.includes('fire')) return <Flame className="w-5 h-5 text-orange-500" />;
        if (l.includes('water')) return <Droplets className="w-5 h-5 text-blue-500" />;
        if (l.includes('air')) return <Wind className="w-5 h-5 text-cyan-500" />;
        if (l.includes('earth')) return <Mountain className="w-5 h-5 text-green-500" />;
        return <Activity className="w-5 h-5" />;
    };

    // Mapping properties based on type
    const mainTitle = data.archetype || data.temperament || data.title;
    const subTitle = data.tagline || data.element || "Your Unique Path";
    const desc = data.description || data.insight;
    
    // Arrays
    const leftListTitle = type === 'personality' ? 'Your Superpowers' : type === 'temperament' ? 'Natural Advantages' : 'Recommended Paths';
    const leftList = data.strengths || data.careers || [];
    
    const rightListTitle = type === 'personality' ? 'Shadow Work' : type === 'temperament' ? 'Energy Drains' : 'Skills to Master';
    const rightList = data.shadowSide || data.stressTriggers || data.skillsToDevelop || [];
    
    // Deep Dive Fields
    const deepDive1Title = type === 'personality' ? 'Love & Connection' : type === 'temperament' ? 'Emotional Needs' : 'Actionable Step';
    const deepDive1Content = data.relationships || data.emotionalNeeds || data.actionableStep || "";
    const deepDive1Icon = type === 'personality' ? <Heart className="w-5 h-5" /> : type === 'temperament' ? <Zap className="w-5 h-5" /> : <Target className="w-5 h-5" />;

    const deepDive2Title = type === 'personality' ? 'Career & Leadership' : type === 'temperament' ? 'Ideal Environment' : null;
    const deepDive2Content = data.workStyle || data.idealEnvironment || "";
    const deepDive2Icon = type === 'personality' ? <Briefcase className="w-5 h-5" /> : type === 'temperament' ? <Home className="w-5 h-5" /> : null;
    
    // New Fields
    const extraContentTitle = type === 'personality' ? 'Famous Examples' : type === 'temperament' ? 'Chronotype' : 'Learning Resources';
    const extraContent = data.famousExamples || data.chronotype || data.learningPath;
    const extraContentIcon = type === 'personality' ? <Fingerprint className="w-5 h-5" /> : type === 'temperament' ? <Clock className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />;

    const extraAlertTitle = type === 'personality' ? 'Core Wound' : null;
    const extraAlert = data.coreWound;

    const footerTipTitle = type === 'personality' ? 'Key to Growth' : type === 'temperament' ? 'Recharge Strategy' : 'Insight';
    const footerTip = data.growthKey || data.rechargeStrategy || "";

    return (
        <div className="space-y-8 animate-fade-in">
            {/* 1. HERO SECTION */}
            <div className="text-center pb-8 border-b border-gray-200 dark:border-white/10">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300 text-xs font-bold uppercase tracking-widest shadow-sm`}>
                    {type === 'temperament' && getElementIcon(data.element)}
                    {title}
                </div>
                <h3 className="text-4xl md:text-6xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">{mainTitle}</h3>
                <div className="max-w-2xl mx-auto">
                    <p className={`text-lg italic text-${color}-600 dark:text-${color}-400 font-medium mb-6`}>"{subTitle}"</p>
                </div>
            </div>

            {/* 2. CORE ESSENCE (Full Width Card) */}
            <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg relative overflow-hidden group">
                 <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -mr-8 -mt-8 group-hover:bg-${color}-500/20 transition-colors`}></div>
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Core Essence
                 </h4>
                 <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl leading-relaxed font-light">
                    {desc}
                 </p>
            </div>

            {/* 3. BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strength Card */}
                <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg text-${color}-600 dark:text-${color}-400`}>
                            <Star className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{leftListTitle}</h4>
                    </div>
                    <ul className="space-y-3">
                        {leftList.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                <CheckCircle2 className={`w-5 h-5 text-${color}-500 shrink-0 mt-0.5`} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Shadow Card */}
                <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                             {type === 'ikigai' ? <Layers className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{rightListTitle}</h4>
                    </div>
                    <ul className="space-y-3">
                        {rightList.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0 ml-1.5"></div>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Deep Dive 1 */}
                {(deepDive1Content) && (
                    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <div className={`flex items-center gap-2 mb-3 text-${color}-700 dark:text-${color}-300 font-bold uppercase text-xs tracking-wider`}>
                            {deepDive1Icon} {deepDive1Title}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {deepDive1Content}
                        </p>
                    </div>
                )}

                {/* Deep Dive 2 */}
                {(deepDive2Content) && (
                    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <div className={`flex items-center gap-2 mb-3 text-${color}-700 dark:text-${color}-300 font-bold uppercase text-xs tracking-wider`}>
                            {deepDive2Icon} {deepDive2Title}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {deepDive2Content}
                        </p>
                    </div>
                )}
            </div>
            
            {/* 4. EXTENDED INFO ROW */}
            <div className="flex flex-col md:flex-row gap-6">
                {extraContent && (
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <div className={`flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider`}>
                            {extraContentIcon} {extraContentTitle}
                        </div>
                        {Array.isArray(extraContent) ? (
                            <div className="flex flex-wrap gap-2">
                                {extraContent.map((item: string, i: number) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300`}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-700 dark:text-gray-300">{extraContent}</p>
                        )}
                    </div>
                )}

                {/* Core Wound / Alert */}
                {extraAlert && (
                     <div className="flex-1 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-4">
                        <Quote className="w-8 h-8 text-red-300 shrink-0" />
                        <div>
                            <div className="text-red-600 dark:text-red-400 font-bold uppercase text-xs tracking-wider mb-2">{extraAlertTitle}</div>
                            <p className="text-gray-800 dark:text-gray-200 italic">"{extraAlert}"</p>
                        </div>
                     </div>
                )}
            </div>

            {/* 5. ACTIONABLE FOOTER */}
            {footerTip && (
                <div className={`p-8 rounded-3xl bg-gradient-to-br from-${color}-50 to-white dark:from-${color}-900/20 dark:to-transparent border border-${color}-100 dark:border-${color}-900/30`}>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className={`p-4 bg-${color}-100 dark:bg-${color}-900/50 rounded-2xl text-${color}-600 dark:text-${color}-400 shrink-0`}>
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className={`font-bold text-${color}-900 dark:text-${color}-200 uppercase text-sm mb-2`}>{footerTipTitle}</h4>
                            <p className="text-gray-800 dark:text-gray-200 text-lg font-medium leading-relaxed">{footerTip}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-8 flex justify-center">
                <button onClick={onNext} className="btn-primary max-w-md w-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                    {btnText} &rarr;
                </button>
            </div>
        </div>
    );
}

const QuizView = ({ title, description, questions, onComplete, loading, loadingMessage, color, icon }: any) => {
    const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
    const [extraText, setExtraText] = useState('');
    const [currentQIndex, setCurrentQIndex] = useState(0);

    const handleSelect = (option: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQIndex] = option;
        setAnswers(newAnswers);
        
        // Auto-advance logic
        if (currentQIndex < questions.length) { 
             setTimeout(() => setCurrentQIndex(currentQIndex + 1), 250);
        }
    };

    if (loading) {
        return <DynamicLoader text={loadingMessage} />;
    }

    const isQuizQuestionsComplete = answers.every(a => a !== '');
    // The "Final Step" is essentially index = length
    const isFinalStep = currentQIndex === questions.length; 

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full mb-6">
                <div 
                    className={`h-1.5 rounded-full transition-all duration-300 bg-${color}-600`} 
                    style={{ width: `${(currentQIndex / questions.length) * 100}%` }}
                ></div>
            </div>

            {!isFinalStep ? (
                <div className="animate-fade-in">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6">
                        {currentQIndex + 1}. {questions[currentQIndex].text}
                    </h3>
                    <div className="space-y-3">
                        {questions[currentQIndex].options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${
                                    answers[currentQIndex] === opt 
                                    ? `bg-${color}-100 dark:bg-${color}-900/30 border-${color}-500 ring-1 ring-${color}-500 transform scale-[1.01]` 
                                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <span className="text-gray-900 dark:text-white text-sm md:text-base">{opt}</span>
                            </button>
                        ))}
                    </div>
                    {currentQIndex > 0 && (
                        <button 
                            onClick={() => setCurrentQIndex(currentQIndex - 1)}
                            className="text-sm text-gray-500 mt-4 hover:underline"
                        >
                            &larr; Previous Question
                        </button>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in space-y-6">
                     <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Almost There</h3>
                        <p className="text-gray-500 text-sm">One final detail to calibrate the analysis.</p>
                     </div>
                    
                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                           Is there any specific nuance about your personality we missed? (Optional)
                        </label>
                        <textarea 
                            className="w-full h-32 bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                            placeholder="I also tend to be..."
                            value={extraText}
                            onChange={(e) => setExtraText(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={() => onComplete(answers, extraText)}
                        disabled={loading}
                        className="btn-primary text-lg py-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        Reveal My Archetype <ArrowIcon className="w-5 h-5" />
                    </button>
                    
                    <button 
                        onClick={() => setCurrentQIndex(questions.length - 1)}
                        className="block w-full text-center text-sm text-gray-400 mt-4 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        Go back
                    </button>
                </div>
            )}
        </div>
    );
};

// Refined Ikigai Form: 4-Step Wizard
const IkigaiForm = ({ onSubmit, loading, loadingMessage }: any) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        love: '',
        goodAt: '',
        worldNeeds: '',
        paidFor: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <DynamicLoader text={loadingMessage} />;
    }

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const steps = [
        {
            key: 'love',
            title: "What do you Love?",
            desc: "List the activities that make you lose track of time. What brings you pure joy?",
            placeholder: "e.g. Painting, Teaching, Solving Puzzles, Gaming...",
            icon: Heart
        },
        {
            key: 'goodAt',
            title: "What are you Good At?",
            desc: "List your hard and soft skills. What do people ask you for help with?",
            placeholder: "e.g. Public Speaking, Coding, Empathy, Math...",
            icon: Star
        },
        {
            key: 'worldNeeds',
            title: "What does the World Need?",
            desc: "What problems do you want to solve? What causes touch your heart?",
            placeholder: "e.g. Clean Energy, Mental Health support, Efficient software...",
            icon: BookOpen
        },
        {
            key: 'paidFor',
            title: "What can you be Paid For?",
            desc: "What are your professional skills? What jobs exist for your talents?",
            placeholder: "e.g. Graphic Designer, Therapist, Engineer...",
            icon: Briefcase
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
             {/* Progress Stepper */}
             <div className="flex justify-between items-center px-2">
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            ${i <= step ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}
                        `}>
                            {i + 1}
                        </div>
                        <div className="hidden sm:block text-[10px] uppercase font-bold text-gray-400">{s.key}</div>
                    </div>
                ))}
             </div>

             <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 rounded-3xl min-h-[300px] flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-4">
                     {React.createElement(steps[step].icon, { className: "w-8 h-8 text-pink-500" })}
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{steps[step].title}</h3>
                 </div>
                 <p className="text-gray-600 dark:text-gray-300 mb-6">{steps[step].desc}</p>
                 
                 <textarea 
                    name={steps[step].key}
                    value={(data as any)[steps[step].key]}
                    onChange={handleChange}
                    className="w-full h-32 bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none text-lg"
                    placeholder={steps[step].placeholder}
                    autoFocus
                 />
             </div>

             <div className="flex justify-between items-center pt-4">
                 <button 
                    onClick={prevStep} 
                    disabled={step === 0}
                    className={`text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white ${step === 0 ? 'opacity-0' : 'opacity-100'}`}
                 >
                     &larr; Back
                 </button>

                 {step < steps.length - 1 ? (
                     <button 
                        onClick={nextStep}
                        disabled={!(data as any)[steps[step].key]}
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                     >
                         Next Step
                     </button>
                 ) : (
                     <button 
                        onClick={() => onSubmit(data.love, data.goodAt, data.worldNeeds, data.paidFor)}
                        disabled={!data.paidFor}
                        className="px-8 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 disabled:opacity-50 transition-all shadow-lg shadow-pink-500/30"
                     >
                         Reveal Ikigai
                     </button>
                 )}
             </div>
        </div>
    )
}

const SynthesisForm = ({ onSubmit, loading, loadingMessage, defaultData }: any) => {
    const [f, setF] = useState({ 
        age: defaultData.age || '', 
        region: defaultData.region || '', 
        religion: defaultData.religion || '', 
        principles: defaultData.principles || '', 
        likes: defaultData.likes || '', 
        dislikes: defaultData.dislikes || '' 
    });
    const handleChange = (k:string, v:string) => setF({...f, [k]: v});

    if (loading) {
        return <DynamicLoader text={loadingMessage} />;
    }
    
    return (
        <div className="grid md:grid-cols-2 gap-4">
             <p className="md:col-span-2 text-gray-600 dark:text-gray-300 mb-2">We need the final pieces of the puzzle to generate your Life Strategy.</p>
             <input className="p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl w-full" placeholder="Age" value={f.age} onChange={e => handleChange('age', e.target.value)} />
             <input className="p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl w-full" placeholder="Region" value={f.region} onChange={e => handleChange('region', e.target.value)} />
             <input className="p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl md:col-span-2 w-full" placeholder="Religion / Philosophy" value={f.religion} onChange={e => handleChange('religion', e.target.value)} />
             <input className="p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl md:col-span-2 w-full" placeholder="Core Principles" value={f.principles} onChange={e => handleChange('principles', e.target.value)} />
             <textarea className="p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl md:col-span-2 h-20 w-full" placeholder="Likes" value={f.likes} onChange={e => handleChange('likes', e.target.value)} />
             <textarea className="p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl md:col-span-2 h-20 w-full" placeholder="Dislikes" value={f.dislikes} onChange={e => handleChange('dislikes', e.target.value)} />
             <button onClick={() => onSubmit(f)} disabled={loading} className="btn-primary md:col-span-2 mt-2">Generate Plan</button>
        </div>
    )
}

const BadgeSVG = ({ data }: any) => (
    <div className="relative">
         <svg id="identity-badge" width="320" height="480" viewBox="0 0 400 600" className="drop-shadow-2xl rounded-2xl w-full h-auto">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#4c1d95', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 1}} />
                    </linearGradient>
                    <filter id="noise">
                         <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad1)" rx="20" ry="20" />
                <rect width="100%" height="100%" filter="url(#noise)" opacity="0.1" rx="20" ry="20" />
                <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" rx="10" />
                
                <text x="200" y="80" textAnchor="middle" fill="#fff" fontFamily="serif" fontSize="24" letterSpacing="4">EUNOIA</text>
                
                <circle cx="200" cy="220" r="80" fill="rgba(255,255,255,0.05)" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="1" />
                <text x="200" y="230" textAnchor="middle" fill="#fff" fontFamily="sans-serif" fontSize="60" opacity="0.8">
                    {data.archetype?.archetype ? data.archetype.archetype[0] : "?"}
                </text>

                <text x="200" y="360" textAnchor="middle" fill="#a855f7" fontFamily="sans-serif" fontSize="14" letterSpacing="2" fontWeight="bold">NICKNAME</text>
                <text x="200" y="390" textAnchor="middle" fill="#fff" fontFamily="serif" fontSize="32" fontStyle="italic">
                    {data.nickname || "Unknown"}
                </text>

                <text x="50" y="460" fill="#fff" fontFamily="sans-serif" fontSize="12" opacity="0.6">ARCHETYPE</text>
                <text x="50" y="480" fill="#fff" fontFamily="sans-serif" fontSize="16" fontWeight="bold">{data.archetype?.archetype || "..."}</text>

                <text x="250" y="460" fill="#fff" fontFamily="sans-serif" fontSize="12" opacity="0.6">TEMPERAMENT</text>
                <text x="250" y="480" fill="#fff" fontFamily="sans-serif" fontSize="16" fontWeight="bold">{data.temperament?.temperament || "..."}</text>

                <text x="200" y="550" textAnchor="middle" fill="#fff" fontFamily="sans-serif" fontSize="10" opacity="0.4">SANCTUARY MEMBER</text>
            </svg>
    </div>
)

const downloadBadge = () => {
    const svgElement = document.getElementById('identity-badge');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
        canvas.width = 400;
        canvas.height = 600;
        ctx?.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const imgURL = canvas.toDataURL('image/png');
        const dlLink = document.createElement('a');
        dlLink.download = 'eunoia-identity.png';
        dlLink.href = imgURL;
        dlLink.click();
    };
    img.src = url;
};

export default DashboardPage;