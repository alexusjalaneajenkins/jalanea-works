'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Zap,
  ArrowRight,
  Star,
  Globe,
  TrendingUp,
  GraduationCap,
  MapPin,
  Search,
  X,
  Heart,
  Instagram,
  Users,
  Coffee,
  Briefcase,
  Clock,
  DollarSign,
  Target,
  Sparkles,
  Send
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

// ============================================
// TYPES
// ============================================

type AuthMode = 'signin' | 'signup'

// ============================================
// ANIMATION VARIANTS
// ============================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const glowPulse = {
  initial: { textShadow: "0 0 20px rgba(255, 196, 37, 0.3)" },
  animate: {
    textShadow: [
      "0 0 20px rgba(255, 196, 37, 0.3)",
      "0 0 40px rgba(255, 196, 37, 0.5)",
      "0 0 20px rgba(255, 196, 37, 0.3)"
    ],
    transition: { duration: 3, ease: "easeInOut" as const, repeat: Infinity }
  }
}

// ============================================
// DATA
// ============================================

const COMMUNITY_COLLEGE_PROGRAMS: Record<string, { roles: { title: string; match: number; salary: string }[]; avgBump: string; openRoles: number }> = {
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
  }
}

const degreeList = Object.keys(COMMUNITY_COLLEGE_PROGRAMS)

const STATS = [
  { value: "2,400+", label: "Jobs Matched", icon: Briefcase },
  { value: "89%", label: "Placement Rate", icon: Target },
  { value: "$48k", label: "Avg Starting Salary", icon: DollarSign },
  { value: "21 days", label: "Avg Time to Hire", icon: Clock }
]

const STEPS = [
  {
    title: "Select Your Degree",
    description: "We map your specific community college coursework directly to the skills employers are looking for.",
    icon: GraduationCap
  },
  {
    title: "Get Matched Instantly",
    description: "Receive personalized job matches with salary estimates and match percentages based on your profile.",
    icon: Sparkles
  },
  {
    title: "Apply Locally",
    description: "We send quality applications to local employers who want homegrown talent.",
    icon: Send
  }
]

// ============================================
// MAIN LANDING PAGE
// ============================================

export default function HomePage() {
  const [degreeSearch, setDegreeSearch] = useState("AS Graphic and Interactive Design")
  const [showResults, setShowResults] = useState(false)

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')

  // Mission Modal State
  const [isMissionOpen, setIsMissionOpen] = useState(false)

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  // Filter logic for search
  const filteredDegrees = degreeList.filter(d =>
    d.toLowerCase().includes(degreeSearch.toLowerCase())
  )

  const matchedDegree = COMMUNITY_COLLEGE_PROGRAMS[degreeSearch] ? degreeSearch : "AS Graphic and Interactive Design"
  const currentData = COMMUNITY_COLLEGE_PROGRAMS[matchedDegree]

  return (
    <div className="min-h-screen flex flex-col bg-[#020617]">
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Mission Modal */}
      {isMissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md"
            onClick={() => setIsMissionOpen(false)}
          />

          <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsMissionOpen(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/50 hover:text-white transition-colors z-50 bg-white/10 rounded-full p-1.5 sm:p-2"
            >
              <X size={18} />
            </button>

            <div className="p-4 sm:p-6 md:p-10 border border-[#ffc425]/20 bg-gradient-to-br from-[#0f172a]/95 via-[#020617] to-[#0f172a]/95 backdrop-blur-xl rounded-3xl">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  <Heart size={10} fill="currentColor" /> Our Purpose
                </div>

                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl mx-auto px-2">
                  Helping Students Go From <span className="text-[#ffc425]">Homelessness to Housing</span> Through Education & Employment
                </h2>

                <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto px-2">
                  Jalanea Works is built for <span className="text-white font-bold">low-income housing students</span> and community college graduates. We connect your degree to entry-level positions so you can work, earn, and build a stable foundation.
                </p>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 text-left">
                  <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffc425]/20 rounded-lg flex items-center justify-center text-[#ffc425] mb-2 sm:mb-3">
                      <GraduationCap size={16} />
                    </div>
                    <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">Your Degree, Your Power</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      We link community college programs directly to careers that want YOUR specific skills.
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffc425]/20 rounded-lg flex items-center justify-center text-[#ffc425] mb-2 sm:mb-3">
                      <TrendingUp size={16} />
                    </div>
                    <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">12-24 Month Runway</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      Find entry-level jobs while in transitional housing. Build savings. Build stability.
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ffc425]/20 rounded-lg flex items-center justify-center text-[#ffc425] mb-2 sm:mb-3">
                      <MapPin size={16} />
                    </div>
                    <h4 className="font-bold text-white mb-1 text-xs sm:text-sm">Alumni Housing Advocacy</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300">
                      We&apos;re fighting for income-restricted housing so graduates can transition sustainably.
                    </p>
                  </div>
                </div>

                {/* Quote with Photo */}
                <div className="pt-4 sm:pt-6 border-t border-white/10 mt-4 sm:mt-6">
                  <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#ffc425] p-0.5 shadow-xl">
                        <img
                          src="https://i.ibb.co/Zzn2BXVQ/VC-Grad-Edited.jpg"
                          alt="Alexus Jalanea Jenkins"
                          className="w-full h-full rounded-full object-cover bg-slate-800"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#ffc425] text-[#020617] p-1 sm:p-1.5 rounded-full border border-white">
                        <GraduationCap size={10} />
                      </div>
                    </div>
                    <p className="text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed text-center max-w-2xl px-2">
                      &quot;I want to create products that <span className="text-[#ffc425] font-bold">move us forward</span> and <span className="text-[#ffc425] font-bold">build bridges</span> for our communities. My mission is to <span className="text-[#ffc425] font-bold">strengthen and empower people</span>. Because when we invest in each other, we all rise.&quot;
                    </p>
                  </div>

                  <Link
                    href="/about"
                    onClick={() => setIsMissionOpen(false)}
                    className="inline-flex items-center gap-2 bg-[#ffc425] hover:bg-[#ffd768] text-[#020617] font-bold rounded-full px-6 py-3 transition-all shadow-xl shadow-[#ffc425]/20"
                  >
                    Learn More About Alexus
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Contact Section */}
                <div className="pt-4 sm:pt-6 border-t border-white/10 mt-3 sm:mt-4">
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-bold mb-3 sm:mb-4">Want to Help or Work Together?</p>
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
                      <Instagram size={14} />
                      Instagram
                    </a>
                    <a
                      href="mailto:alexusjenkins@uiuxdesign.us"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#ffc425]/10 border border-[#ffc425]/30 rounded-lg text-[#ffc425] hover:bg-[#ffc425]/20 transition-colors text-xs sm:text-sm font-bold"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Email
                    </a>
                    <button
                      disabled
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed text-xs sm:text-sm font-bold"
                      title="Portfolio coming soon!"
                    >
                      <Globe size={14} />
                      Portfolio
                      <span className="text-[8px] sm:text-[10px] bg-slate-700 text-slate-200 px-1 sm:px-1.5 py-0.5 rounded uppercase">Soon</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl md:text-2xl tracking-tight text-white">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[#ffc425] to-[#ffd768] flex items-center justify-center text-[#020617]">
              <Zap size={16} fill="currentColor" />
            </div>
            <span>Jalanea<span className="text-[#ffc425] font-light">Works</span></span>
          </div>

          {/* Centered Nav Links */}
          <nav className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/mission" className="text-sm font-medium text-slate-300 hover:text-[#ffc425] transition-colors">Our Why</Link>
            <Link href="/entrepreneur" className="text-sm font-medium text-slate-300 hover:text-[#ffc425] transition-colors">Start a Business</Link>
            <Link href="/blog" className="text-sm font-medium text-slate-300 hover:text-[#ffc425] transition-colors">Blog</Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-[#ffc425] transition-colors">Pricing</Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => openAuth('signin')}
              className="text-sm font-medium text-white hover:text-[#ffc425] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="bg-[#ffc425] hover:bg-[#ffd768] text-[#020617] font-bold rounded-full px-5 py-2.5 text-sm transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Auth */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => openAuth('signin')}
              className="text-sm font-bold text-white hover:text-[#ffc425] transition-colors px-2 py-1"
            >
              Sign in
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="bg-[#ffc425] hover:bg-[#ffd768] text-[#020617] font-bold rounded-full px-4 py-2 text-sm transition-all"
            >
              Join
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 md:pt-28 pb-8 md:pb-12 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6 md:space-y-8 text-center lg:text-left"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-white">
                The Entry-Level Job Market, <span className="text-[#ffc425]">Solved.</span>
                <span className="text-2xl sm:text-3xl md:text-4xl text-slate-300 font-normal mt-2 block">For Community College Grads.</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-200 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Stop applying to &quot;entry-level&quot; jobs that want 3 years of experience. We match you with employers specifically looking for <span className="text-white font-semibold">your degree and fresh talent.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => openAuth('signup')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ffc425] hover:bg-[#ffd768] text-[#020617] font-bold rounded-full px-8 py-4 text-lg shadow-[0_0_30px_rgba(255,196,37,0.3)] hover:shadow-[0_0_40px_rgba(255,196,37,0.5)] transform hover:-translate-y-1 transition-all"
                >
                  <Zap size={20} fill="currentColor" />
                  Match My Degree
                </button>

                <button
                  onClick={() => setIsMissionOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 hover:border-[#ffc425] text-white font-semibold rounded-full px-8 py-4 backdrop-blur-sm transition-all"
                >
                  Our Mission
                </button>
              </div>
            </motion.div>

            {/* Right Content: Live Career Mapping Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="shadow-2xl backdrop-blur-xl border border-white/10 relative z-20 rounded-3xl bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80">
                <div className="p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Career Mapping</span>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                      </span>
                      <span className="text-green-400 font-bold text-xs uppercase tracking-wider">Analysis Active</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Search Input */}
                    <div className="space-y-2 relative">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Type Your Degree or Certificate</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Search size={18} />
                        </div>
                        <input
                          type="text"
                          value={degreeSearch}
                          onChange={(e) => {
                            setDegreeSearch(e.target.value)
                            setShowResults(true)
                          }}
                          onFocus={() => setShowResults(true)}
                          onBlur={() => setTimeout(() => setShowResults(false), 200)}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-[#ffc425] focus:border-transparent outline-none font-medium text-base transition-all"
                          placeholder="e.g. Graphic Design"
                        />
                        {degreeSearch && (
                          <button
                            onClick={() => setDegreeSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown */}
                      {showResults && filteredDegrees.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                          {filteredDegrees.map((degree) => (
                            <div
                              key={degree}
                              className="p-3 text-white hover:bg-white/10 cursor-pointer font-medium text-sm border-b border-white/5 last:border-0"
                              onClick={() => {
                                setDegreeSearch(degree)
                                setShowResults(false)
                              }}
                            >
                              {degree}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex justify-center -my-1 relative z-20">
                      <div className="bg-[#1e293b] rounded-full p-2 border border-white/10">
                        <ArrowRight className="text-[#ffc425] rotate-90" size={18} />
                      </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Qualified Entry-Level Roles</label>
                      <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                        {currentData?.roles.map((role, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Star size={12} className={idx === 0 ? "text-[#ffc425]" : "text-slate-500"} fill={idx === 0 ? "currentColor" : "none"} />
                                <span className="text-white font-semibold text-sm">{role.title}</span>
                              </div>
                              <span className="text-slate-400 text-xs ml-5">{role.salary}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[#ffc425] font-bold text-base">{role.match}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Results Footer */}
                  <div className="pt-5 -mx-5 sm:-mx-6 md:-mx-8 -mb-5 sm:-mb-6 md:-mb-8 p-5 sm:p-6 md:p-8 rounded-b-3xl bg-[#0f172a]/50 border-t border-white/5">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Salary Bump</span>
                        <span className="font-bold text-xl sm:text-2xl text-white">{currentData?.avgBump}<span className="text-slate-400 text-base">/yr</span></span>
                      </div>
                      <div className="h-10 w-px bg-white/10" />
                      <div className="flex flex-col text-right">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Open Local Roles</span>
                        <span className="font-bold text-xl sm:text-2xl text-white">{currentData?.openRoles}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openAuth('signup')}
                      className="w-full bg-[#ffc425] hover:bg-[#ffd768] text-[#020617] font-bold rounded-xl py-4 transition-all shadow-xl shadow-[#ffc425]/10"
                    >
                      Unlock These Opportunities
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#ffc425]/5 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 border-y border-white/5 bg-[#0f172a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {STATS.map((stat, i) => (
              <motion.div key={i} className="text-center" variants={fadeInUp}>
                <div className="inline-flex items-center justify-center w-10 h-10 mb-3 rounded-full bg-[#ffc425]/10 text-[#ffc425]">
                  <stat.icon size={20} />
                </div>
                <motion.div
                  className="text-2xl md:text-3xl font-bold text-white mb-1"
                  variants={glowPulse}
                  initial="initial"
                  animate="animate"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-slate-300 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              How it <span className="text-[#ffc425]">works</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Three simple steps to transform your credentials into career opportunities
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {STEPS.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="group">
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl h-full transition-all duration-500 hover:border-[#ffc425]/30 hover:shadow-[0_0_40px_rgba(255,196,37,0.1)]">
                  <div className="w-14 h-14 mb-6 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-[#ffc425] group-hover:bg-[#ffc425]/10 group-hover:border-[#ffc425]/30 transition-all duration-300">
                    <step.icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Impact Section */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-[#0f172a]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-widest">
                <Heart size={12} fill="currentColor" /> Light the Block
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Building careers that <span className="text-[#ffc425]">build communities</span>
              </h2>
              <p className="text-lg text-slate-200 leading-relaxed">
                Jalanea Works isn&apos;t just about finding jobs—it&apos;s about transforming local workforces from the ground up. Every placement strengthens local economies and proves that community college graduates are the backbone of innovation.
              </p>
              <motion.div
                className="flex flex-wrap gap-4 pt-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { value: "94%", label: "Say life-changing" },
                  { value: "Local", label: "Focused opportunities" },
                  { value: "Direct", label: "College partnerships" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-center min-w-[140px] hover:border-[#ffc425]/30 transition-colors"
                    variants={fadeInUp}
                  >
                    <div className="text-3xl font-bold text-[#ffc425] mb-1">{item.value}</div>
                    <div className="text-sm text-slate-300">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                { icon: Users, title: "Community First", desc: "We prioritize local employers who believe in investing in homegrown talent." },
                { icon: TrendingUp, title: "Breaking Cycles", desc: "Education should be the exit strategy from poverty. We bridge the gap to that first sustainable paycheck." },
                { icon: Zap, title: "AI-Powered Advocacy", desc: "Our AI translates your community college coursework into professional assets that speak to employers." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 p-5 bg-white/5 border border-white/5 rounded-xl hover:border-[#ffc425]/20 transition-colors group"
                  variants={fadeInUp}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#ffc425]/10 flex items-center justify-center text-[#ffc425] group-hover:bg-[#ffc425] group-hover:text-[#020617] transition-all">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-300">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#ffc425]/5 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to start your <span className="text-[#ffc425]">career?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of community college graduates who&apos;ve transformed their credentials into rewarding careers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => openAuth('signup')}
                className="inline-flex items-center gap-2 bg-[#ffc425] hover:bg-[#ffd768] text-[#020617] font-bold rounded-full px-8 py-4 text-lg shadow-[0_0_30px_rgba(255,196,37,0.4)] hover:shadow-[0_0_50px_rgba(255,196,37,0.6)] transition-all"
              >
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-transparent border border-slate-600 hover:border-[#ffc425] text-white font-semibold rounded-full px-8 py-4 text-lg hover:bg-white/5 transition-all"
              >
                See Pricing Plans
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">No credit card required • Free for community college students</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] text-white py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffc425] to-[#ffd768] flex items-center justify-center text-[#020617]">
                  <Zap size={16} fill="currentColor" />
                </div>
                Jalanea<span className="text-[#ffc425] font-light">Works</span>
              </div>
              <p className="text-slate-300 mb-4">
                Your credentials should open doors. We make sure they do — for community college grads, first-gen students, and anyone the system overlooked.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffc425]/10 border border-[#ffc425]/20 text-[#ffc425] text-xs font-bold">
                <Zap size={12} /> Jalanea: Light the Block
              </div>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Platform</h4>
                <div className="space-y-3">
                  <Link href="/mission" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">Our Mission</Link>
                  <Link href="/entrepreneur" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">Start a Business</Link>
                  <button onClick={() => openAuth('signup')} className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors text-left">Find Jobs</button>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">About</h4>
                <div className="space-y-3">
                  <Link href="/about" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">The Founder</Link>
                  <a href="https://www.linkedin.com/in/alexusjalaneajenkins/" target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">LinkedIn</a>
                  <a href="https://www.instagram.com/JalaneaJ_/" target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">Instagram</a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Support</h4>
                <div className="space-y-3">
                  <Link href="/support" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">Help & FAQ</Link>
                  <a href="https://buymeacoffee.com/jalanea" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-200 hover:text-[#ffc425] transition-colors">
                    <Coffee size={14} /> Support the Founder
                  </a>
                  <a href="mailto:business@jalanea.works" className="block text-sm text-slate-200 hover:text-[#ffc425] transition-colors">Partner With Us</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-xs text-slate-400 font-medium flex flex-col md:flex-row justify-between gap-4 uppercase tracking-wider">
            <div>© 2024 Jalanea Works Inc. | Part of the Jalanea: Light the Block Movement</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#ffc425] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#ffc425] transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
