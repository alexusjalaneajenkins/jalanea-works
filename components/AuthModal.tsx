
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { ValenciaDegreeSelect } from './ValenciaDegreeSelect';
import { suggestRolesForDegree } from '../services/geminiService';
import { 
  X, Zap, Globe, User, Wand2, Sparkles, ArrowRight, 
  CheckCircle2, ChevronRight, ChevronLeft, MapPin, Linkedin, Search, 
  Plus, Trash2, Home, Building, Building2, Armchair, Crown, Info, Loader2,
  Camera, BookOpen, Video, Car, Bus, Bike, Footprints, Baby, Clock, Briefcase, DollarSign
} from 'lucide-react';
import { LearningStyle, TransportMode, EmploymentStatus } from '../types';

export type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: AuthMode;
  onComplete: () => void;
}

const VIEWS = {
  LOGIN: 'LOGIN',
  INTRO: 'INTRO',
  SIGNUP: 'SIGNUP', // Create Account screen
  WIZARD_BASICS: 'WIZARD_BASICS',
  WIZARD_EDU: 'WIZARD_EDU',
  WIZARD_EXP: 'WIZARD_EXP',
  WIZARD_PREFS: 'WIZARD_PREFS',
  WIZARD_LOGISTICS: 'WIZARD_LOGISTICS', // New Step
  WIZARD_LIFESTYLE: 'WIZARD_LIFESTYLE'
};

// --- DATA CONSTANTS ---

// Provided AI Matching Data
const CAREER_MATCH_DATA: Record<string, Record<string, string[]>> = {
  "AS_Degrees": {
    "Graphic and Interactive Design": [
      "Junior Web Designer",
      "UI Support Specialist",
      "Digital Marketing Coordinator",
      "Graphic Production Artist"
    ],
    "Computer Programming and Analysis": [
      "Junior Software Developer",
      "Support Technician",
      "QA Tester",
      "Junior Data Analyst"
    ],
    "Hospitality and Tourism Management": [
      "Guest Services Coordinator",
      "Front Desk Supervisor",
      "Event Assistant",
      "Resort Operations Coordinator"
    ]
  },
};

const DEGREE_LEVEL_MAP: Record<string, string> = {
  'Associate of Science (A.S.)': 'AS_Degrees',
  'Bachelor of Science (B.S.)': 'Bachelors_Degrees',
  'Technical Certificate': 'Technical_Certificates',
  'Advanced Technical Certificate': 'Technical_Certificates' 
};

const FLORIDA_HOUSING_TIERS = [
  {
    label: "Economy / Efficiency",
    rentRange: "$850 - $1,000",
    minSalary: 30000,
    maxSalary: 42000,
    insight: "🏠 Budget-Focused: Affords a private room or efficiency studio.",
    color: "border-jalanea-400",
    icon: Home
  },
  {
    label: "Standard 1-Bedroom",
    rentRange: "$1,000 - $1,300",
    minSalary: 42000,
    maxSalary: 52000,
    insight: "🏢 Independent Living: Affords a standard 1-bedroom apartment.",
    color: "border-blue-400",
    icon: Building
  },
  {
    label: "The Sweet Spot",
    rentRange: "$1,300 - $1,500",
    minSalary: 52000,
    maxSalary: 60000,
    insight: "✨ Comfort Zone: Affords a nice 1-bed or entry-level 2-bedroom.",
    color: "border-indigo-400",
    icon: Building2
  },
  {
    label: "Comfort 2-Bedroom",
    rentRange: "$1,500 - $1,800",
    minSalary: 60000,
    maxSalary: 75000,
    insight: "🛋️ Room to Grow: Affords a modern 2-bedroom apartment.",
    color: "border-purple-400",
    icon: Armchair
  },
  {
    label: "Luxury / Family Size",
    rentRange: "$1,800+",
    minSalary: 75000,
    maxSalary: 200000,
    insight: "🌟 Premium Living: Affords luxury amenities or a 3-bedroom unit.",
    color: "border-gold",
    icon: Crown
  }
];

// Extracted WizardLayout component to prevent re-mounting issues
interface WizardLayoutProps {
  title: string;
  children: React.ReactNode;
  nextStep: () => void;
  prevStep?: () => void;
  isLast?: boolean;
  currentView: string;
}

const WizardLayout: React.FC<WizardLayoutProps> = ({ title, children, nextStep, prevStep, isLast = false, currentView }) => (
  <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300 max-w-2xl mx-auto w-full overflow-hidden">
     <div className="mb-6 flex items-center justify-between shrink-0">
         <h2 className="text-xl font-display font-bold text-white">{title}</h2>
         <div className="flex gap-1">
             {[VIEWS.WIZARD_BASICS, VIEWS.WIZARD_EDU, VIEWS.WIZARD_EXP, VIEWS.WIZARD_PREFS, VIEWS.WIZARD_LOGISTICS, VIEWS.WIZARD_LIFESTYLE].map((view, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full ${currentView === view ? 'bg-gold' : 'bg-white/20'}`} />
             ))}
         </div>
     </div>

     <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-4 min-h-0">
         {children}
     </div>

     <div className="mt-8 pt-4 border-t border-white/10 flex gap-4 shrink-0">
         {prevStep ? (
             <>
                 <Button 
                     variant="glass-light" 
                     onClick={prevStep} 
                     className="flex-1"
                 >
                     Back
                 </Button>
                 <Button 
                     variant="primary" 
                     onClick={nextStep} 
                     className="flex-1 bg-gold text-jalanea-950 hover:bg-gold-light border-none shadow-lg shadow-gold/10"
                 >
                     {isLast ? 'Complete Profile' : 'Next'}
                 </Button>
             </>
         ) : (
             <Button 
                 fullWidth 
                 variant="primary" 
                 onClick={nextStep} 
                 className="w-full bg-gold text-jalanea-950 hover:bg-gold-light border-none shadow-lg shadow-gold/10"
             >
                 {isLast ? 'Complete Profile' : 'Next'}
             </Button>
         )}
     </div>
  </div>
);

interface EducationEntry {
  id: number;
  degreeLevel: string;
  program: string;
  gradYear: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onComplete }) => {
  const [currentView, setCurrentView] = useState(VIEWS.LOGIN);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // --- Form States ---
  
  // Education State - Converted to Array
  const [educationList, setEducationList] = useState<EducationEntry[]>([
    { id: 1, degreeLevel: 'Associate of Science (A.S.)', program: '', gradYear: '' }
  ]);

  // Experience
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [tempExp, setTempExp] = useState({ role: '', company: '', duration: '' });

  // Preferences
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [autoMatched, setAutoMatched] = useState(false);
  const [matchSource, setMatchSource] = useState<'static' | 'ai'>('static');
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [roleInput, setRoleInput] = useState('');

  // Logistics (New)
  const [isParent, setIsParent] = useState(false);
  const [childCount, setChildCount] = useState(1);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('Unemployed');

  // Lifestyle
  const [workStyles, setWorkStyles] = useState<string[]>([]);
  const [salary, setSalary] = useState(45000);
  // Removed salaryViewMode as we now show both
  
  // New: Learning & Transport (Arrays)
  const [learningStyle, setLearningStyle] = useState<LearningStyle[]>(['Video']);
  const [transportMode, setTransportMode] = useState<TransportMode[]>(['Car']);

  // --- Logic Helpers ---

  // Housing Tier Logic
  const activeTier = useMemo(() => {
    return FLORIDA_HOUSING_TIERS.find(t => salary >= t.minSalary && salary < t.maxSalary) 
        || FLORIDA_HOUSING_TIERS[FLORIDA_HOUSING_TIERS.length - 1];
  }, [salary]);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialMode === 'signup' ? VIEWS.INTRO : VIEWS.LOGIN);
      setCarouselIndex(0);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Education Helpers
  const addDegree = () => {
    setEducationList(prev => [
      ...prev,
      { id: Date.now(), degreeLevel: 'Associate of Science (A.S.)', program: '', gradYear: '' }
    ]);
  };

  const removeDegree = (id: number) => {
    setEducationList(prev => prev.filter(edu => edu.id !== id));
  };

  const updateDegree = (id: number, field: keyof EducationEntry, value: string) => {
    setEducationList(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleProgramSelection = async (edu: EducationEntry, val: string) => {
    updateDegree(edu.id, 'program', val);
    
    if (!val) return;

    // 1. Try Static Database first
    const dbKey = DEGREE_LEVEL_MAP[edu.degreeLevel];
    if (dbKey) {
       const matchedRoles = CAREER_MATCH_DATA[dbKey]?.[val];
       if (matchedRoles && matchedRoles.length > 0) {
           // Merge new roles with existing unique roles
           setTargetRoles(prev => Array.from(new Set([...prev, ...matchedRoles])));
           setAutoMatched(true);
           setMatchSource('static');
           return;
       }
    }

    // 2. Fallback to AI Generation
    setIsLoadingRoles(true);
    try {
        const aiRoles = await suggestRolesForDegree(val);
        if (aiRoles && aiRoles.length > 0) {
            setTargetRoles(prev => Array.from(new Set([...prev, ...aiRoles])));
            setAutoMatched(true);
            setMatchSource('ai');
        }
    } catch (e) {
        console.error("AI Role gen failed", e);
    } finally {
        setIsLoadingRoles(false);
    }
  };


  const handleAddExperience = () => {
    if (tempExp.role && tempExp.company) {
        setExperiences([...experiences, tempExp]);
        setTempExp({ role: '', company: '', duration: '' });
        setIsAddingExperience(false);
    }
  };

  const handleDeleteExperience = (index: number) => {
    const newExp = [...experiences];
    newExp.splice(index, 1);
    setExperiences(newExp);
  };

  const handleAddRole = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roleInput.trim()) {
      e.preventDefault();
      if (!targetRoles.includes(roleInput.trim())) {
        setTargetRoles([...targetRoles, roleInput.trim()]);
      }
      setRoleInput('');
    }
  };

  const toggleWorkStyle = (style: string) => {
    if (workStyles.includes(style)) {
        setWorkStyles(workStyles.filter(s => s !== style));
    } else {
        setWorkStyles([...workStyles, style]);
    }
  };
  
  const toggleLearningStyle = (style: LearningStyle) => {
      if (learningStyle.includes(style)) {
          setLearningStyle(learningStyle.filter(s => s !== style));
      } else {
          setLearningStyle([...learningStyle, style]);
      }
  };

  const toggleTransportMode = (mode: TransportMode) => {
      if (transportMode.includes(mode)) {
          setTransportMode(transportMode.filter(m => m !== mode));
      } else {
          setTransportMode([...transportMode, mode]);
      }
  };

  const handleGoogleAuth = () => {
    if (currentView === VIEWS.LOGIN) {
       onComplete(); 
    } else {
       setCurrentView(VIEWS.WIZARD_BASICS);
    }
  };

  const handleEmailAuth = () => {
     if (currentView === VIEWS.LOGIN) {
        onComplete();
     } else {
        setCurrentView(VIEWS.WIZARD_BASICS);
     }
  };

  // --- Renderers ---

  const renderLogin = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-sm mx-auto w-full">
       <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white">Welcome Back</h2>
          <p className="text-jalanea-400 text-sm mt-1">Sign in to continue your career journey.</p>
       </div>

       <Button fullWidth variant="primary" onClick={handleGoogleAuth} className="bg-gold hover:bg-gold-light text-jalanea-950 font-bold border-none h-12">
          <Globe size={18} className="mr-2"/> Continue with Google
       </Button>

       <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-bold text-jalanea-500 uppercase">Or continue with email</span>
          <div className="flex-grow border-t border-white/10"></div>
       </div>

       <div className="space-y-4">
          <Input variant="dark-glass" placeholder="Email Address" type="email" />
          <Input variant="dark-glass" placeholder="Password" type="password" />
       </div>

       <Button fullWidth variant="secondary" onClick={handleEmailAuth} className="bg-jalanea-800 border-white/10 h-12">
          Sign In
       </Button>

       <div className="text-center">
          <p className="text-sm text-jalanea-400">
            Don't have an account?{' '}
            <button onClick={() => setCurrentView(VIEWS.INTRO)} className="text-gold font-bold hover:underline">
              Get Started
            </button>
          </p>
       </div>
    </div>
  );

  const renderIntro = () => {
    const slides = [
       { icon: <User size={40} />, title: "Build Your Profile", desc: "Tell us your degree once. We match it to live roles." },
       { icon: <Sparkles size={40} />, title: "AI Matching", desc: "We scan thousands of jobs for your specific skills." },
       { icon: <Wand2 size={40} />, title: "One-Click Tailoring", desc: "Generate custom resumes instantly." }
    ];

    return (
      <div className="text-center space-y-10 animate-in fade-in slide-in-from-right-8 duration-300 py-4 h-full flex flex-col justify-center">
         <h2 className="text-3xl font-display font-bold text-white">How it Works</h2>
         
         <div className="flex justify-center gap-6">
            {slides.map((slide, i) => (
                <div key={i} className={`
                    w-1/3 p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 text-center
                    ${i === carouselIndex 
                        ? 'bg-white/10 border-gold/50 text-white shadow-[0_0_25px_rgba(255,196,37,0.15)] scale-105 z-10' 
                        : 'bg-white/5 border-white/5 text-jalanea-500 opacity-60 scale-95'}
                `}>
                    <div className={`${i === carouselIndex ? 'text-gold' : 'text-current'} transform transition-transform duration-300`}>
                        {slide.icon}
                    </div>
                    <div className="space-y-2 w-full">
                        <h3 className="text-sm font-bold uppercase tracking-wider">{slide.title}</h3>
                        <p className={`text-sm leading-relaxed ${i === carouselIndex ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                            {slide.desc}
                        </p>
                    </div>
                </div>
            ))}
         </div>

         <div className="flex flex-col items-center gap-6">
             <div className="flex justify-center gap-2">
                 {slides.map((_, i) => (
                     <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-8 bg-gold' : 'w-2 bg-white/20'}`}></div>
                 ))}
             </div>

             <div className="w-full max-w-xs">
                 <Button 
                    fullWidth 
                    variant="primary" 
                    onClick={() => {
                        if (carouselIndex < 2) setCarouselIndex(p => p + 1);
                        else setCurrentView(VIEWS.SIGNUP);
                    }}
                    className="h-12 text-base shadow-xl shadow-gold/20"
                 >
                    {carouselIndex === 2 ? "Let's Go" : "Next"}
                 </Button>
             </div>
         </div>
      </div>
    );
  };

  const renderSignup = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 max-w-sm mx-auto w-full">
       <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-white">Create Account</h2>
          <p className="text-jalanea-400 text-sm mt-1">Start your free profile today.</p>
       </div>

       <Button fullWidth variant="primary" onClick={handleGoogleAuth} className="bg-gold hover:bg-gold-light text-jalanea-950 font-bold border-none h-12">
          <Globe size={18} className="mr-2"/> Continue with Google
       </Button>

       <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-bold text-jalanea-500 uppercase">Or with email</span>
          <div className="flex-grow border-t border-white/10"></div>
       </div>

       <div className="space-y-4">
          <Input variant="dark-glass" placeholder="Email Address" type="email" />
          <Input variant="dark-glass" placeholder="Password" type="password" />
       </div>

       <Button fullWidth variant="primary" onClick={handleEmailAuth} className="bg-white text-jalanea-950 hover:bg-jalanea-200 border-none h-12">
          Create Account
       </Button>
       
       <div className="text-center">
          <p className="text-sm text-jalanea-400">
            Already have an account?{' '}
            <button onClick={() => setCurrentView(VIEWS.LOGIN)} className="text-gold font-bold hover:underline">
              Log In
            </button>
          </p>
       </div>
    </div>
  );

  // --- Wizard Steps ---

  const renderBasics = () => (
     <WizardLayout 
        title="Let's get to know you." 
        nextStep={() => setCurrentView(VIEWS.WIZARD_EDU)}
        currentView={currentView}
     >
        <div className="flex justify-center mb-6">
            <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-jalanea-500 group-hover:border-gold group-hover:text-gold transition-all overflow-hidden cursor-pointer">
                    <User size={40} />
                </div>
                {/* Camera Button */}
                <button className="absolute bottom-0 right-0 p-2 bg-gold text-jalanea-950 rounded-full shadow-lg hover:bg-gold-light hover:scale-105 transition-all">
                    <Camera size={16} />
                </button>
            </div>
        </div>
        <Input variant="dark-glass" placeholder="Full Name" />
        <Input variant="dark-glass" placeholder="Location (e.g. Orlando, FL)" icon={<MapPin size={16}/>} />
        <Input variant="dark-glass" placeholder="LinkedIn URL" icon={<Linkedin size={16}/>} />
        <Input variant="dark-glass" placeholder="Portfolio URL (Optional)" icon={<Globe size={16}/>} />
     </WizardLayout>
  );

  const renderEducation = () => (
     <WizardLayout 
        title="Show off your hard work." 
        prevStep={() => setCurrentView(VIEWS.WIZARD_BASICS)}
        nextStep={() => setCurrentView(VIEWS.WIZARD_EXP)}
        currentView={currentView}
     >
        <div className="space-y-6">
            {educationList.map((edu, index) => (
              <div key={edu.id} className="relative p-5 border border-white/10 rounded-2xl bg-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Remove Degree Button */}
                {index > 0 && (
                  <button 
                    onClick={() => removeDegree(edu.id)}
                    className="absolute top-4 right-4 text-jalanea-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="space-y-4">
                  <Input variant="dark-glass" label="Institution" defaultValue="Valencia College" />
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white text-sm font-bold mb-2 block">Degree Level</label>
                        <select 
                            value={edu.degreeLevel}
                            onChange={(e) => updateDegree(edu.id, 'degreeLevel', e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-gold focus:border-gold appearance-none"
                        >
                            <option>Associate of Science (A.S.)</option>
                            <option>Bachelor of Science (B.S.)</option>
                            <option>Technical Certificate</option>
                            <option>Advanced Technical Certificate</option>
                        </select>
                      </div>
                      <Input 
                        variant="dark-glass" 
                        label="Grad Year" 
                        placeholder="2024" 
                        value={edu.gradYear}
                        onChange={(e) => updateDegree(edu.id, 'gradYear', e.target.value)}
                      />
                  </div>

                  <ValenciaDegreeSelect 
                    variant="dark-glass"
                    label="Major/Program"
                    degreeLevel={edu.degreeLevel}
                    value={edu.program}
                    onChange={(val) => handleProgramSelection(edu, val)}
                  />
                </div>
              </div>
            ))}

            <button 
              onClick={addDegree}
              className="w-full py-3 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-2 text-gold font-bold text-sm hover:bg-white/5 hover:border-gold/50 transition-all"
            >
                <Plus size={16} />
                Add Another Degree
            </button>
        </div>
     </WizardLayout>
  );

  const renderExperience = () => (
    <WizardLayout 
        title="Experience & Projects." 
        prevStep={() => setCurrentView(VIEWS.WIZARD_EDU)}
        nextStep={() => setCurrentView(VIEWS.WIZARD_PREFS)}
        currentView={currentView}
     >
        {experiences.length === 0 && !isAddingExperience ? (
            <div 
                onClick={() => setIsAddingExperience(true)}
                className="border border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-white/5 cursor-pointer transition-colors group h-48"
            >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-jalanea-400 group-hover:text-gold mb-4 transition-colors">
                    <Zap size={24} />
                </div>
                <span className="text-white font-bold text-lg">Add Position</span>
                <span className="text-jalanea-500 text-sm mt-1">Work, Internship, or Project</span>
            </div>
        ) : (
            <div className="space-y-4">
                {experiences.map((exp, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center group">
                        <div>
                            <h4 className="font-bold text-white text-base">{exp.role}</h4>
                            <p className="text-sm text-jalanea-400 mt-1">{exp.company} • {exp.duration}</p>
                        </div>
                        <button 
                            onClick={() => handleDeleteExperience(idx)}
                            className="p-2 text-jalanea-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                
                {!isAddingExperience && (
                    <Button 
                        fullWidth 
                        variant="glass-light" 
                        onClick={() => setIsAddingExperience(true)}
                        className="border-dashed"
                    >
                        <Plus size={16} className="mr-2" /> Add Another Position
                    </Button>
                )}
            </div>
        )}

        {isAddingExperience && (
            <div className="bg-jalanea-950/50 p-6 rounded-xl border border-white/10 space-y-4 animate-in zoom-in-95 duration-200">
                <h4 className="text-white font-bold mb-2">New Position</h4>
                <Input 
                    variant="dark-glass" 
                    placeholder="Role Title" 
                    value={tempExp.role}
                    onChange={e => setTempExp({...tempExp, role: e.target.value})}
                />
                <Input 
                    variant="dark-glass" 
                    placeholder="Company / Organization" 
                    value={tempExp.company}
                    onChange={e => setTempExp({...tempExp, company: e.target.value})}
                />
                <Input 
                    variant="dark-glass" 
                    placeholder="Duration (e.g. Summer 2024)" 
                    value={tempExp.duration}
                    onChange={e => setTempExp({...tempExp, duration: e.target.value})}
                />
                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" className="text-jalanea-400" onClick={() => setIsAddingExperience(false)}>Cancel</Button>
                    <Button fullWidth variant="primary" onClick={handleAddExperience}>Save</Button>
                </div>
            </div>
        )}
     </WizardLayout>
  );

  const renderPrefs = () => (
    <WizardLayout 
        title="What are you looking for?" 
        prevStep={() => setCurrentView(VIEWS.WIZARD_EXP)}
        nextStep={() => setCurrentView(VIEWS.WIZARD_LOGISTICS)}
        currentView={currentView}
     >
        <div className="space-y-8">
            {/* Target Roles - Chips */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <label className="text-white text-sm font-bold block">Target Roles</label>
                    {isLoadingRoles && (
                        <div className="flex items-center gap-2 text-jalanea-400 text-xs">
                             <Loader2 size={12} className="animate-spin" /> Generating matches...
                        </div>
                    )}
                    {!isLoadingRoles && autoMatched && (
                        <div className="group relative flex items-center">
                            <span className="bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-help border border-gold/20">
                                <Sparkles size={10} /> {matchSource === 'static' ? 'Placement Match' : 'AI Suggested'}
                            </span>
                        </div>
                    )}
                </div>
                
                <div className="bg-black/20 p-3 border border-white/10 rounded-xl flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-gold transition-all min-h-[50px]">
                    {targetRoles.map(role => (
                       <span key={role} className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 animate-in zoom-in duration-200">
                          {role}
                          <button onClick={() => setTargetRoles(targetRoles.filter(r => r !== role))} className="hover:text-red-400"><X size={12}/></button>
                       </span>
                    ))}
                    <input 
                       className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30 min-w-[120px]" 
                       placeholder="Add another role..."
                       value={roleInput}
                       onChange={(e) => setRoleInput(e.target.value)}
                       onKeyDown={handleAddRole}
                    />
                </div>
            </div>

            {/* Work Style - Toggles */}
            <div>
                <label className="text-white text-sm font-bold mb-3 block">Work Style</label>
                <div className="flex gap-3">
                    {['Remote', 'Hybrid', 'On-site'].map(s => (
                        <button 
                            key={s} 
                            onClick={() => toggleWorkStyle(s)}
                            className={`
                                flex-1 py-3 rounded-xl text-sm font-bold border transition-all duration-200
                                ${workStyles.includes(s) 
                                    ? 'bg-gold text-jalanea-950 border-gold shadow-[0_0_15px_rgba(255,196,37,0.3)]' 
                                    : 'bg-transparent text-jalanea-400 border-white/10 hover:border-white/30 hover:bg-white/5'}
                            `}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Learning Style */}
            <div>
               <label className="text-white text-sm font-bold mb-3 block">Preferred Learning Styles</label>
               <div className="flex gap-3">
                  {[
                      { type: 'Video', icon: Video }, 
                      { type: 'Reading', icon: BookOpen },
                      { type: 'Both', icon: Sparkles }
                  ].map((style) => (
                      <button 
                          key={style.type}
                          onClick={() => toggleLearningStyle(style.type as LearningStyle)}
                          className={`
                             flex-1 py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                             ${learningStyle.includes(style.type as LearningStyle)
                                ? 'bg-white/20 border-gold text-white shadow-[0_0_10px_rgba(255,196,37,0.2)]'
                                : 'bg-transparent border-white/10 text-jalanea-400 hover:bg-white/5'}
                          `}
                      >
                         <style.icon size={18} />
                         <span className="text-xs font-bold">{style.type}</span>
                      </button>
                  ))}
               </div>
            </div>
        </div>
     </WizardLayout>
  );

  const renderLogistics = () => (
     <WizardLayout
        title="Reality Check."
        prevStep={() => setCurrentView(VIEWS.WIZARD_PREFS)}
        nextStep={() => setCurrentView(VIEWS.WIZARD_LIFESTYLE)}
        currentView={currentView}
     >
        <div className="space-y-8">
            <p className="text-jalanea-400 text-sm">We build your schedule based on your real life obligations. No judgment, just logistics.</p>

            {/* Parenting */}
            <div>
                <label className="text-white text-sm font-bold mb-3 block">Are you a parent?</label>
                <div className="flex gap-3 mb-4">
                    <button 
                        onClick={() => setIsParent(true)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${isParent ? 'bg-gold text-jalanea-950 border-gold' : 'bg-transparent text-jalanea-400 border-white/10 hover:bg-white/5'}`}
                    >
                        Yes
                    </button>
                    <button 
                        onClick={() => setIsParent(false)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${!isParent ? 'bg-white/20 text-white border-white/30' : 'bg-transparent text-jalanea-400 border-white/10 hover:bg-white/5'}`}
                    >
                        No
                    </button>
                </div>
                {isParent && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <Input 
                            variant="dark-glass" 
                            label="Number of Children" 
                            type="number" 
                            value={childCount} 
                            onChange={(e) => setChildCount(parseInt(e.target.value) || 0)}
                            icon={<Baby size={16}/>}
                        />
                    </div>
                )}
            </div>

            {/* Employment Status */}
            <div>
                <label className="text-white text-sm font-bold mb-3 block">Current Employment Status</label>
                <div className="grid grid-cols-2 gap-3">
                    {['Unemployed', 'Full-time', 'Part-time', 'Multiple Jobs', 'Student'].map((status) => (
                        <button 
                            key={status}
                            onClick={() => setEmploymentStatus(status as EmploymentStatus)}
                            className={`
                                py-3 px-2 rounded-xl text-xs font-bold border transition-all
                                ${employmentStatus === status 
                                    ? 'bg-jalanea-800 text-gold border-gold' 
                                    : 'bg-transparent text-jalanea-400 border-white/10 hover:bg-white/5'}
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Available Hours Hint */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-3 items-start">
                <Clock size={20} className="text-gold shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-white font-bold text-sm">Schedule Preview</h4>
                    <p className="text-xs text-jalanea-400 mt-1 leading-relaxed">
                        Based on this, we'll suggest {isParent || employmentStatus === 'Multiple Jobs' ? <span className="text-gold font-bold">15-minute micro-tasks</span> : <span className="text-gold font-bold">2-hour deep work blocks</span>} for your job search.
                    </p>
                </div>
            </div>
        </div>
     </WizardLayout>
  );

  const renderLifestyle = () => {
    // Dynamic housing calculation
    const monthlyRentBudget = Math.round(salary / 12 * 0.3);
    
    return (
     <WizardLayout
        title="Lifestyle & Commute."
        prevStep={() => setCurrentView(VIEWS.WIZARD_LOGISTICS)}
        nextStep={onComplete}
        isLast
        currentView={currentView}
     >
        <div className="space-y-8">
            {/* Transportation Mode */}
            <div>
               <label className="text-white text-sm font-bold mb-3 block">Primary Transportation Options</label>
               <div className="grid grid-cols-6 gap-2">
                  {[
                      { mode: 'Car', icon: Car },
                      { mode: 'Bus', icon: Bus },
                      { mode: 'Bike', icon: Bike },
                      { mode: 'Scooter', icon: Zap },
                      { mode: 'Walk', icon: Footprints },
                      { mode: 'Uber', icon: Car }
                  ].map((t) => (
                      <button 
                          key={t.mode}
                          onClick={() => toggleTransportMode(t.mode as TransportMode)}
                          className={`
                             py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200
                             ${transportMode.includes(t.mode as TransportMode) 
                                ? 'bg-white/20 border-white text-white'
                                : 'bg-transparent border-white/10 text-jalanea-400 hover:bg-white/5'}
                          `}
                      >
                         <t.icon size={18} />
                         <span className="text-[9px] font-bold uppercase">{t.mode}</span>
                      </button>
                  ))}
               </div>
            </div>

            {/* Salary & Budget */}
            <div>
                <label className="text-white text-sm font-bold mb-4 block">Lifestyle Planning</label>
                
                {/* Simplified Display: Only Annual Salary */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-jalanea-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Selected Annual Salary
                    </p>
                    <div className="text-4xl font-display font-bold text-white tracking-tight">
                        ${salary.toLocaleString()}
                        <span className="text-lg text-jalanea-500 font-medium ml-1">/yr</span>
                    </div>
                </div>

                {/* The Slider */}
                <div className="px-1 mb-8">
                    <div className="flex justify-between text-xs text-jalanea-500 font-bold mb-2 uppercase tracking-wider">
                        <span>$30k/yr</span>
                        <span>$100k+/yr</span>
                    </div>
                    <input 
                        type="range" 
                        min="30000" 
                        max="100000" 
                        step="1000"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="w-full accent-gold bg-white/10 h-2 rounded-full appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Housing Card - Updated to show Calculated Budget dynamically */}
                    <div className={`relative p-4 rounded-xl border-l-4 bg-gradient-to-r from-white/5 to-transparent transition-all duration-500 ${activeTier.color}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <activeTier.icon className={`w-4 h-4 ${activeTier.color.replace('border-', 'text-')}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTier.color.replace('border-', 'text-')}`}>
                                Housing Power
                            </span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-1">
                            {activeTier.label}
                        </h3>
                        <p className="text-xs text-jalanea-400">
                            Budget: <span className="text-white font-bold">${monthlyRentBudget.toLocaleString()}/mo</span>
                            <br/>
                            <span className="opacity-70 text-[10px]">Tier Avg: {activeTier.rentRange}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
     </WizardLayout>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-jalanea-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl mx-auto z-10 flex flex-col max-h-[90vh]">
        <Card variant="glass-dark" className="shadow-2xl border-white/10 bg-jalanea-900/95 backdrop-blur-2xl flex-1 flex flex-col overflow-hidden min-h-[500px]">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
            >
                <X size={24} />
            </button>

            {/* Content Area */}
            <div className="p-4 w-full h-full flex flex-col justify-center overflow-hidden">
               {currentView === VIEWS.LOGIN && renderLogin()}
               {currentView === VIEWS.INTRO && renderIntro()}
               {currentView === VIEWS.SIGNUP && renderSignup()}
               {currentView === VIEWS.WIZARD_BASICS && renderBasics()}
               {currentView === VIEWS.WIZARD_EDU && renderEducation()}
               {currentView === VIEWS.WIZARD_EXP && renderExperience()}
               {currentView === VIEWS.WIZARD_PREFS && renderPrefs()}
               {currentView === VIEWS.WIZARD_LOGISTICS && renderLogistics()}
               {currentView === VIEWS.WIZARD_LIFESTYLE && renderLifestyle()}
            </div>
        </Card>
      </div>
    </div>
  );
};
