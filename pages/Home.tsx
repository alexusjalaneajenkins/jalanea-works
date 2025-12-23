
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { NavRoute } from '../types';
import { AuthModal, AuthMode } from '../components/AuthModal';
import { WelcomeTransition } from '../components/WelcomeTransition';
import { ArrowRight, Star, Globe, ShieldCheck, Zap, TrendingUp, GraduationCap, ChevronDown, MapPin, Search, X, Heart, Home as HomeIcon, Instagram, CheckCircle2, Users, Coffee } from 'lucide-react';

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

  // Welcome Transition State
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState<string>('');
  const [welcomeUserPhoto, setWelcomeUserPhoto] = useState<string>('');

  // Mission Modal State
  const [isMissionOpen, setIsMissionOpen] = useState(false);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const navigate = useNavigate();

  const handleAuthComplete = (userName?: string, userPhoto?: string) => {
    setIsAuthOpen(false);
    // Show welcome transition before navigating
    setWelcomeUserName(userName || '');
    setWelcomeUserPhoto(userPhoto || '');
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    navigate('/onboarding');
  };

  // Filter logic for search
  const filteredDegrees = degreeList.filter(d =>
    d.toLowerCase().includes(degreeSearch.toLowerCase())
  );

  const matchedDegree = VALENCIA_PROGRAMS[degreeSearch] ? degreeSearch : "AS Graphic and Interactive Design";
  const currentData = VALENCIA_PROGRAMS[matchedDegree];

  return (
    <div className="min-h-screen flex flex-col bg-jalanea-50">
      {/* Welcome Transition */}
      {showWelcome && (
        <WelcomeTransition
          userName={welcomeUserName}
          userPhoto={welcomeUserPhoto}
          onComplete={handleWelcomeComplete}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onComplete={handleAuthComplete}
        setRoute={setRoute}
      />

      {/* --- MISSION MODAL --- */}
      {isMissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-jalanea-950/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsMissionOpen(false)} />

          <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <button onClick={() => setIsMissionOpen(false)} className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/50 hover:text-white transition-colors z-50 bg-white/10 rounded-full p-1.5 sm:p-2">
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            <Card variant="glass-dark" className="p-4 sm:p-6 md:p-10 border-gold/20 bg-gradient-to-br from-jalanea-900/95 via-jalanea-950 to-jalanea-900/95 backdrop-blur-xl">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  <Heart size={10} className="sm:w-3 sm:h-3" fill="currentColor" /> Our Purpose
                </div>

                <h2 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-white leading-tight max-w-3xl mx-auto px-2">
                  Helping Students Go From <span className="text-gold">Homelessness to Housing</span> Through Education & Employment
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-jalanea-200 leading-relaxed max-w-3xl mx-auto px-2">
                  Jalanea Works is built for <span className="text-white font-bold">low-income housing students</span> and Valencia College graduates. We connect your degree to entry-level positions so you can work, earn, and build a stable foundation.
                </p>

                {/* 3 Pillars - Stack on mobile, 3 cols on tablet+ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 text-left">
                  <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold/20 rounded-lg flex items-center justify-center text-gold mb-2 sm:mb-3">
                      <GraduationCap size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">Your Degree, Your Power</h4>
                    <p className="text-[11px] sm:text-xs text-jalanea-300">
                      We link Valencia & UCF programs directly to careers that want YOUR specific skills.
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold/20 rounded-lg flex items-center justify-center text-gold mb-2 sm:mb-3">
                      <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">12-24 Month Runway</h4>
                    <p className="text-[11px] sm:text-xs text-jalanea-300">
                      Find entry-level jobs while in transitional housing. Build savings. Build stability.
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold/20 rounded-lg flex items-center justify-center text-gold mb-2 sm:mb-3">
                      <MapPin size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">Alumni Housing Advocacy</h4>
                    <p className="text-[11px] sm:text-xs text-jalanea-300">
                      We're fighting for income-restricted housing so graduates can transition sustainably.
                    </p>
                  </div>
                </div>

                {/* Quote with Photo */}
                <div className="pt-4 sm:pt-6 border-t border-white/10 mt-4 sm:mt-6">
                  <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Graduation Photo */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gold p-0.5 shadow-xl">
                        <img
                          src="https://i.ibb.co/Zzn2BXVQ/VC-Grad-Edited.jpg"
                          alt="Alexus Jalanea Jenkins"
                          className="w-full h-full rounded-full object-cover bg-jalanea-800"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gold text-jalanea-950 p-1 sm:p-1.5 rounded-full border border-white">
                        <GraduationCap size={10} className="sm:w-3 sm:h-3" />
                      </div>
                    </div>
                    {/* Quote */}
                    <p className="text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed text-center max-w-2xl px-2">
                      "I want to create products that <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow font-bold">move us forward</span> and <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow font-bold">build bridges</span> for our communities. My mission is to <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow font-bold">strengthen and empower people</span>. Because when we invest in each other, we all rise."
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsMissionOpen(false);
                      navigate('/about');
                    }}
                    icon={<ArrowRight size={16} />}
                    className="shadow-xl shadow-gold/20"
                  >
                    Learn More About Alexus
                  </Button>
                </div>

                {/* Contact Section */}
                <div className="pt-4 sm:pt-6 border-t border-white/10 mt-3 sm:mt-4">
                  <p className="text-[10px] sm:text-xs text-jalanea-500 uppercase tracking-widest font-bold mb-3 sm:mb-4">Want to Help or Work Together?</p>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    <a
                      href="https://www.linkedin.com/in/alexusjalaneajenkins/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#0077B5]/10 border border-[#0077B5]/30 rounded-lg text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors text-xs sm:text-sm font-bold"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      LinkedIn
                    </a>
                    <a
                      href="https://www.instagram.com/JalaneaJ_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#E4405F]/10 border border-[#E4405F]/30 rounded-lg text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors text-xs sm:text-sm font-bold"
                    >
                      <Instagram size={14} className="sm:w-4 sm:h-4" />
                      Instagram
                    </a>
                    <a
                      href="mailto:alexusjenkins@uiuxdesign.us"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold hover:bg-gold/20 transition-colors text-xs sm:text-sm font-bold"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Email
                    </a>
                    <button
                      disabled
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-jalanea-500 cursor-not-allowed text-xs sm:text-sm font-bold"
                      title="Portfolio coming soon!"
                    >
                      <Globe size={14} className="sm:w-4 sm:h-4" />
                      Portfolio
                      <span className="text-[8px] sm:text-[10px] bg-jalanea-700 text-jalanea-300 px-1 sm:px-1.5 py-0.5 rounded uppercase">Soon</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
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
            <button onClick={() => navigate('/mission')} className="text-sm font-bold text-jalanea-200 hover:text-white transition-colors">Our Why</button>
            <button onClick={() => navigate('/entrepreneur')} className="text-sm font-bold text-jalanea-200 hover:text-white transition-colors">Start a Business</button>
            <button onClick={() => navigate('/blog')} className="text-sm font-bold text-jalanea-200 hover:text-white transition-colors">Blog</button>
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
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-wider shadow-lg">
                <Zap size={14} className="md:w-4 md:h-4" />
                Work Should Work
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-[0.95] tracking-tighter text-white">
                Get a job by the<br />
                <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow">end of the month.</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-jalanea-200 leading-relaxed max-w-lg mx-auto md:mx-0 font-light px-2 md:px-0">
                Your credentials should pay off. <span className="text-white font-bold">3 quality applications per day.</span> We turn your degree into a direct pipeline to the life you deserve.
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
              For many, financial aid covers the degree, but not the transition. We are building a tool to ensure that students who fight their way to graduation don't return to the struggle. We provide the guidance needed to secure a stable future.
            </p>
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
              <div className="flex items-center gap-2 font-display font-bold text-2xl tracking-tighter mb-4">
                Jalanea<span className="text-gold">Works</span>
              </div>
              <p className="text-jalanea-400 max-w-xs mb-4">
                Your credentials should open doors. We make sure they do — for community college grads, first-gen students, and anyone the system overlooked.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold">
                <Zap size={12} /> Jalanea: Light the Block
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4">
              <div>
                <h4 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider mb-4">Platform</h4>
                <div className="space-y-3">
                  <button onClick={() => navigate('/mission')} className="block text-sm text-jalanea-300 hover:text-white transition-colors">Our Mission</button>
                  <button onClick={() => navigate('/entrepreneur')} className="block text-sm text-jalanea-300 hover:text-white transition-colors">Start a Business</button>
                  <button onClick={() => openAuth('signup')} className="block text-sm text-jalanea-300 hover:text-white transition-colors">Find Jobs</button>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider mb-4">About</h4>
                <div className="space-y-3">
                  <button onClick={() => navigate('/about')} className="block text-sm text-jalanea-300 hover:text-white transition-colors">The Founder</button>
                  <a href="https://www.linkedin.com/in/alexusjalaneajenkins/" target="_blank" rel="noopener noreferrer" className="block text-sm text-jalanea-300 hover:text-white transition-colors">LinkedIn</a>
                  <a href="https://www.instagram.com/JalaneaJ_/" target="_blank" rel="noopener noreferrer" className="block text-sm text-jalanea-300 hover:text-white transition-colors">Instagram</a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider mb-4">Support</h4>
                <div className="space-y-3">
                  <a href="https://buymeacoffee.com/jalanea" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-jalanea-300 hover:text-gold transition-colors">
                    <Coffee size={14} /> Support the Founder
                  </a>
                  <a href="mailto:business@jalanea.works" className="block text-sm text-jalanea-300 hover:text-white transition-colors">Partner With Us</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/10 text-xs text-jalanea-500 font-medium flex flex-col md:flex-row justify-between gap-4 uppercase tracking-wider">
            <div>© 2024 Jalanea Works Inc. | Part of the Jalanea: Light the Block Movement</div>
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