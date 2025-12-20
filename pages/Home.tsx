
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { NavRoute } from '../types';
import { AuthModal, AuthMode } from '../components/AuthModal';
import { ArrowRight, Star, Globe, ShieldCheck, Zap, TrendingUp, GraduationCap, ChevronDown, MapPin, Search, X, Heart, Home as HomeIcon, Instagram, CheckCircle2, Users } from 'lucide-react';

interface HomeProps {
  setRoute: (route: NavRoute) => void;
}

// Valencia College Program Data Mapping
const VALENCIA_PROGRAMS: Record<string, { roles: { title: string; match: number; salary: string }[]; avgBump: string; openRoles: number }> = {
  "AS Graphic and Interactive Design": {
    roles: [
      { title: "Junior Web Designer", match: 94, salary: "$52k - $65k" },
      { title: "UI Support Specialist", match: 89, salary: "$48k - $58k" },
      { title: "Digital Marketing Coordinator", match: 82, salary: "$45k - $55k" }
    ],
    avgBump: "+$32,000",
    openRoles: 124
  },
  "AS Computer Programming & Analysis": {
    roles: [
      { title: "Junior Software Developer", match: 96, salary: "$60k - $75k" },
      { title: "QA Analyst", match: 91, salary: "$55k - $68k" },
      { title: "IT Support Specialist", match: 85, salary: "$45k - $55k" }
    ],
    avgBump: "+$42,000",
    openRoles: 215
  },
  "AS Business Administration": {
    roles: [
      { title: "Business Operations Associate", match: 92, salary: "$45k - $55k" },
      { title: "Sales Development Rep", match: 88, salary: "$50k - $70k" },
      { title: "HR Assistant", match: 85, salary: "$42k - $50k" }
    ],
    avgBump: "+$24,000",
    openRoles: 340
  },
  "AS Cyber Security & Network Eng": {
    roles: [
      { title: "SOC Analyst Level 1", match: 95, salary: "$65k - $80k" },
      { title: "Network Administrator", match: 90, salary: "$60k - $75k" },
      { title: "IT Security Associate", match: 88, salary: "$58k - $70k" }
    ],
    avgBump: "+$45,000",
    openRoles: 89
  },
  "AS Hospitality & Tourism Mgmt": {
    roles: [
      { title: "Guest Experience Manager", match: 93, salary: "$48k - $58k" },
      { title: "Event Coordinator", match: 89, salary: "$45k - $55k" },
      { title: "Hotel Operations Supervisor", match: 86, salary: "$50k - $60k" }
    ],
    avgBump: "+$22,000",
    openRoles: 412
  },
  "BS Electrical & Computer Eng Tech": {
    roles: [
      { title: "Electrical Engineering Tech", match: 97, salary: "$70k - $85k" },
      { title: "Control Systems Tech", match: 92, salary: "$68k - $80k" },
      { title: "Field Service Engineer", match: 88, salary: "$65k - $78k" }
    ],
    avgBump: "+$48,000",
    openRoles: 67
  },
  "AS Medical Administration": {
    roles: [
      { title: "Medical Office Manager", match: 94, salary: "$45k - $58k" },
      { title: "Health Information Tech", match: 90, salary: "$42k - $52k" },
      { title: "Patient Services Coord", match: 85, salary: "$38k - $48k" }
    ],
    avgBump: "+$20,000",
    openRoles: 156
  },
  "Certificate: Web Development": {
    roles: [
      { title: "Junior Front-End Dev", match: 85, salary: "$45k - $60k" },
      { title: "Content Manager", match: 80, salary: "$40k - $50k" },
      { title: "WordPress Specialist", match: 92, salary: "$42k - $55k" }
    ],
    avgBump: "+$18,000",
    openRoles: 98
  }
};

const degreeList = Object.keys(VALENCIA_PROGRAMS);

export const Home: React.FC<HomeProps> = ({ setRoute }) => {
  const [degreeSearch, setDegreeSearch] = useState<string>("AS Graphic and Interactive Design");
  const [showResults, setShowResults] = useState(false);
  const [focused, setFocused] = useState(false);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Mission Modal State
  const [isMissionOpen, setIsMissionOpen] = useState(false);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const navigate = useNavigate();

  const handleAuthComplete = () => {
    setIsAuthOpen(false);
    // Use React Router navigate for actual navigation
    navigate('/jobs');
  };

  // Filter logic for search
  const filteredDegrees = degreeList.filter(d =>
    d.toLowerCase().includes(degreeSearch.toLowerCase())
  );

  const matchedDegree = VALENCIA_PROGRAMS[degreeSearch] ? degreeSearch : "AS Graphic and Interactive Design";
  const currentData = VALENCIA_PROGRAMS[matchedDegree];

  return (
    <div className="min-h-screen flex flex-col bg-jalanea-50">
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onComplete={handleAuthComplete}
        setRoute={setRoute}
      />

      {/* --- MISSION MODAL --- */}
      {isMissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-jalanea-950/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsMissionOpen(false)} />
          {/* INCREASED WIDTH TO max-w-7xl */}
          <Card variant="glass-dark" className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border-white/10 shadow-2xl bg-jalanea-900">
            <button onClick={() => setIsMissionOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50">
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              {/* Left: The Vision */}
              <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 text-xs font-bold uppercase tracking-wider mb-6">
                    <Heart size={12} fill="currentColor" /> Our Mission
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                    From Degree to <span className="text-gold">Dignity.</span>
                  </h2>
                  <p className="text-jalanea-300 leading-relaxed text-lg md:text-xl">
                    For many, <span className="text-white font-medium">graduation isn't a finish line, it's a cliff.</span> We are fighting for the students who feel invisible, who lack a safety net, and who are <span className="text-white font-medium">trying to build a life without a foundation.</span>
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-red-400 border border-white/10 shadow-lg">
                      <HomeIcon size={28} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">The Goal: Alumni Housing</h3>
                      <p className="text-jalanea-400 text-base leading-relaxed mt-1">
                        We advocate for <span className="text-white font-medium">transitional housing</span> for graduates. A stable roof means you can <span className="text-white font-medium">focus on your career, not survival.</span> We want to bridge the gap between graduation day and the first paycheck.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gold border border-white/10 shadow-lg">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">Empowering Orlando</h3>
                      <p className="text-jalanea-400 text-base leading-relaxed mt-1">
                        When talent leaves, communities suffer. By <span className="text-white font-medium">connecting Valencia graduates to local businesses</span>, we keep talent, and economic power, <span className="text-white font-medium">right here in our neighborhoods.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <p className="text-white text-sm font-bold mb-4 uppercase tracking-wide">Behind the Mission</p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setIsMissionOpen(false);
                      navigate('/about');
                    }}
                    className="py-4 shadow-xl shadow-gold/20"
                    icon={<ArrowRight size={18} />}
                  >
                    Learn More About Alexus
                  </Button>
                </div>
              </div>

              {/* Right: The Context (Visual/Story) */}
              <div className="relative bg-jalanea-950 p-8 md:p-12 flex flex-col justify-center overflow-hidden border-t lg:border-t-0 lg:border-l border-white/10">
                {/* Abstract Mesh Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-jalanea-900 to-jalanea-950"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-jalanea-950 to-transparent"></div>

                <div className="relative z-10 space-y-10">
                  <blockquote className="text-2xl md:text-3xl font-display font-medium text-white leading-relaxed">
                    "I want to design systems that transform communities. Companies often outsource talent, leaving our neighborhoods behind. <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow font-bold">It's time to invest in our own.</span>"
                  </blockquote>

                  <div className="flex items-start gap-5">
                    {/* PHOTO UPDATE: Using the DIRECT URL provided */}
                    <div className="relative">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-gold p-1 shadow-2xl">
                        <img
                          src="https://i.ibb.co/Zzn2BXVQ/VC-Grad-Edited.jpg"
                          alt="Alexus Jalanea Jenkins"
                          className="w-full h-full rounded-full object-cover bg-jalanea-800"
                          onError={(e) => {
                            // Fallback to initials if link fails, preserving brand identity
                            e.currentTarget.src = "https://ui-avatars.com/api/?name=Alexus+Jalanea+Jenkins&background=FFC425&color=020617&size=128";
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 bg-gold text-jalanea-950 p-1.5 rounded-full shadow-lg border border-white">
                        <GraduationCap size={14} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="text-white font-bold text-xl md:text-2xl mb-1">Alexus Jalanea Jenkins</div>
                      <div className="text-jalanea-400 font-medium mb-3">Founder & Orlando Native</div>

                      {/* Credentials Badges */}
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-jalanea-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                          <CheckCircle2 size={12} className="text-gold" />
                          B.A.S. Computing Tech & Software Dev
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-jalanea-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                          <CheckCircle2 size={12} className="text-gold" />
                          A.S. Graphic & Interactive Design
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm shadow-xl">
                    <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Zap size={16} className="text-gold" /> The Reality Gap
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-jalanea-200 font-medium">Degree Completed</span>
                          <span className="text-green-400 font-bold">✓ Success</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-jalanea-200 font-medium">Housing Stability</span>
                          <span className="text-red-400 font-bold flex items-center gap-1">⚠ Critical Risk</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 w-[15%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        </div>
                      </div>

                      <p className="text-sm text-jalanea-400 italic border-t border-white/10 pt-4 mt-2">
                        "Too many students achieve the first but lose the second. We are here to fix the system."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navbar - Glass Effect */}
      <header className="fixed w-full z-40 bg-jalanea-950/90 backdrop-blur-md border-b border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl md:text-2xl tracking-tighter text-white">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gold-sheen flex items-center justify-center text-jalanea-950">
              <Zap size={16} fill="currentColor" />
            </div>
            <span>Jalanea<span className="text-gold font-light">Works</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-bold text-jalanea-200 hover:text-white transition-colors">Platform</a>
            <a href="#" className="text-sm font-bold text-jalanea-200 hover:text-white transition-colors">Valencia Alumni</a>
            <a href="#" className="text-sm font-bold text-jalanea-200 hover:text-white transition-colors">Pricing</a>
            <div className="h-4 w-px bg-white/20"></div>
            <button className="text-sm font-bold text-white hover:text-gold transition-colors" onClick={() => openAuth('signin')}>Sign in</button>
            <Button size="sm" variant="primary" onClick={() => openAuth('signup')}>Get Started</Button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button className="text-sm font-bold text-white hover:text-gold transition-colors px-2 py-1" onClick={() => openAuth('signin')}>Sign in</button>
            <Button size="sm" variant="primary" onClick={() => openAuth('signup')}>Join</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 md:pt-32 pb-8 md:pb-12 bg-jalanea-900 overflow-hidden">
        {/* Background Mesh Gradients - Slate & Gold */}
        <div className="absolute inset-0 bg-premium-gradient"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-jalanea-800/60 rounded-full blur-[100px] mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] mix-blend-overlay"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* REDUCED GRID GAP from 12 to 6 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-4 md:space-y-6 animate-in slide-in-from-left-4 duration-700 text-center md:text-left">
              {/* FIXED: Readable Badge - White text on Solid Red Background */}
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-red-DEFAULT border border-red-400/50 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-DEFAULT/20">
                <GraduationCap size={14} className="md:w-4 md:h-4" />
                For Valencia College Alumni
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-[0.95] tracking-tighter text-white">
                Get a job by the<br />
                <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow">end of the month.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-jalanea-200 leading-relaxed max-w-lg mx-auto md:mx-0 font-light px-2 md:px-0">
                Our goal is simple: <span className="text-white font-bold">3 quality applications per day.</span> Let our AI turn your Valencia credentials into a direct pipeline to the life you deserve.
              </p>

              {/* CTA Buttons - STACK ON MOBILE */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 px-4 md:px-0">
                <Button
                  onClick={() => {
                    const element = document.getElementById('career-map');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="primary"
                  className="w-full sm:w-auto bg-gold hover:bg-gold-light text-jalanea-950 font-bold border-none shadow-[0_0_20px_rgba(255,196,37,0.3)] hover:shadow-[0_0_30px_rgba(255,196,37,0.5)] transform hover:-translate-y-1 transition-all"
                >
                  <Zap className="mr-2 fill-current" size={18} />Match My Credentials
                </Button>

                <Button
                  onClick={() => setIsMissionOpen(true)}
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 hover:bg-white/10 hover:border-white/40 text-white backdrop-blur-sm"
                >
                  <HomeIcon className="mr-2" size={18} />Our Mission
                </Button>
              </div>
            </div>

            {/* Right Content: The "Show and Tell" Calculator - NOW VISIBLE ON MOBILE */}
            <div className="relative animate-in slide-in-from-right-4 duration-700 delay-150 mt-8 md:mt-0">
              {/* Glass Card Container */}
              <Card variant="glass-dark" className="shadow-2xl backdrop-blur-xl border border-white/10 relative z-20 mx-4 md:mx-0" noPadding>
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-jalanea-300 uppercase tracking-widest">Live Career Mapping</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
                      </span>
                      <span className="text-gold font-bold text-xs uppercase tracking-wider">Analysis Active</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Input 1: Searchable Degree Selector */}
                    <div className="space-y-2 group relative">
                      <label className="text-xs font-bold text-white/90 uppercase tracking-wider mb-2 block">Type Your Degree or Certificate</label>

                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                          <Search size={18} />
                        </div>
                        <input
                          type="text"
                          value={degreeSearch}
                          onChange={(e) => {
                            setDegreeSearch(e.target.value);
                            setShowResults(true);
                          }}
                          onFocus={() => {
                            setFocused(true);
                            setShowResults(true);
                          }}
                          onBlur={() => setTimeout(() => setShowResults(false), 200)}
                          className="w-full bg-jalanea-950 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:ring-2 focus:ring-gold focus:border-transparent outline-none font-display font-medium text-lg transition-all shadow-inner"
                          placeholder="e.g. Graphic Design"
                        />
                        {degreeSearch && (
                          <button
                            onClick={() => setDegreeSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown */}
                      {showResults && filteredDegrees.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-jalanea-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                          {filteredDegrees.map((degree) => (
                            <div
                              key={degree}
                              className="p-3 text-white hover:bg-white/10 cursor-pointer font-medium text-sm border-b border-white/5 last:border-0"
                              onClick={() => {
                                setDegreeSearch(degree);
                                setShowResults(false);
                              }}
                            >
                              {degree}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex justify-center -my-2 relative z-20">
                      <div className="bg-jalanea-800 rounded-full p-2 border border-white/20 shadow-lg">
                        <ArrowRight className="text-gold rotate-90" size={20} />
                      </div>
                    </div>

                    {/* Dynamic Results List */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-jalanea-300 uppercase tracking-wider">Qualified Entry-Level Roles</label>

                      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                        {currentData?.roles.map((role, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Star size={12} className={idx === 0 ? "text-gold" : "text-white/40"} fill={idx === 0 ? "currentColor" : "none"} />
                                <span className="text-white font-bold text-sm">{role.title}</span>
                              </div>
                              <span className="text-jalanea-300 text-xs ml-5">{role.salary}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-gold font-bold text-sm">{role.match}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Results Footer */}
                  <div className="pt-4 sm:pt-6 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 md:-mx-8 md:-mb-8 p-4 sm:p-6 md:p-8 rounded-b-2xl bg-black/20 border-t border-white/5">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <div className="flex flex-col">
                        <span className="text-jalanea-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Est. Salary Bump</span>
                        <span className="font-display font-bold text-lg sm:text-2xl text-white">{currentData?.avgBump}<span className="text-white/40 text-sm sm:text-lg">/yr</span></span>
                      </div>
                      <div className="h-8 sm:h-10 w-px bg-white/10"></div>
                      <div className="flex flex-col text-right">
                        <span className="text-jalanea-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Open Local Roles</span>
                        <span className="font-display font-bold text-lg sm:text-2xl text-white">{currentData?.openRoles}</span>
                      </div>
                    </div>
                    <Button fullWidth onClick={() => openAuth('signup')} variant="primary" className="shadow-gold/10 shadow-xl">
                      Unlock These Opportunities
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gold/5 rounded-full blur-3xl -z-10"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 relative overflow-hidden bg-jalanea-50">
        <div className="absolute inset-0 bg-subtle-mesh opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-jalanea-900 mb-6 tracking-tight">From Graduation to <span className="text-transparent bg-clip-text bg-premium-gradient">Stability.</span></h2>
            <p className="text-xl text-jalanea-700/80 leading-relaxed">
              For many, financial aid covers the degree, but not the transition. We are building a tool to ensure that students who fight their way to graduation don't return to the struggle—providing the guidance needed to secure a stable future.
            </p>
          </div>

          {/* Transformation Visual - Image Placeholder for Custom Asset */}
          <div className="relative w-full max-w-5xl mx-auto mb-20 rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
            <img
              src="JalaneaWorks_VCImage2png.png"
              alt="Valencia College Transformation: From instability to homeownership and career success"
              className="w-full h-auto object-contain transition-transform duration-700"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-jalanea-900/90 via-jalanea-900/20 to-transparent flex items-end justify-center pb-12">
              <span className="text-white/90 font-display font-medium text-xl md:text-2xl italic tracking-wide text-center px-4">
                "The door to opportunity shouldn't be locked by instability."
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users size={32} />,
                title: "Community Transformation",
                desc: "We are on a mission to partner with Orlando employers, convincing them to invest in local talent. When our graduates succeed, our entire community rises."
              },
              {
                icon: <TrendingUp size={32} />,
                title: "Breaking the Cycle",
                desc: "Education should be the exit strategy from poverty. We bridge the critical gap between walking across the stage and receiving that first sustainable paycheck."
              },
              {
                icon: <Zap size={32} />,
                title: "AI-Powered Advocacy",
                desc: "You've done the work. Our AI translates your specific Valencia coursework into professional assets, advocating for your skills even when you don't know how to."
              }
            ].map((feature, i) => (
              <Card key={i} variant="glass-light" className="p-8 hover:-translate-y-2 transition-transform duration-500 group border-jalanea-200">
                <div className="mb-6 p-4 bg-white rounded-2xl w-16 h-16 flex items-center justify-center text-jalanea-900 shadow-md group-hover:bg-gold group-hover:text-jalanea-950 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-jalanea-900 mb-4">{feature.title}</h3>
                <p className="text-jalanea-600 leading-relaxed font-medium">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-jalanea-950 text-white py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tighter mb-6">
                Jalanea<span className="text-gold">Works</span>
              </div>
              <p className="text-jalanea-400 max-w-xs mb-6">
                Empowering Valencia College graduates to launch thriving careers in Central Florida and beyond.
              </p>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/10 text-xs text-jalanea-500 font-medium flex flex-col md:flex-row justify-between gap-4 uppercase tracking-wider">
            <div>© 2024 Jalanea Works Inc.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};