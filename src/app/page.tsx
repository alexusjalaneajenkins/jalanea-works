'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Search,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  ChevronDown,
  Star,
  Shield,
  Users,
  Menu,
  X
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'

// ============================================
// TYPES
// ============================================

interface Role {
  title: string
  salary: string
  match: number
  icon: React.ReactNode
}

type AuthMode = 'signin' | 'signup'

// ============================================
// DATA
// ============================================

const sampleRoles: Role[] = [
  { title: 'Junior Web Designer', salary: '$52k - $65k', match: 94, icon: <Sparkles size={14} /> },
  { title: 'UI Support Specialist', salary: '$48k - $58k', match: 89, icon: <Star size={14} /> },
  { title: 'Digital Marketing Coordinator', salary: '$45k - $55k', match: 82, icon: <TrendingUp size={14} /> },
]

// ============================================
// COMPONENTS
// ============================================

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="nav-link text-[#cbd5e1] hover:text-[#ffc425] transition-colors">
      {children}
    </a>
  )
}

function StatCard({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-2xl sm:text-3xl font-bold text-[#ffc425] stat-number">{value}</div>
      <div className="text-xs sm:text-sm text-[#94a3b8] uppercase tracking-wide mt-1">{label}</div>
    </motion.div>
  )
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode; title: string; description: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="feature-card"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ffc425]/20 to-[#ffc425]/5 border border-[#ffc425]/20 flex items-center justify-center mb-4 sm:mb-6">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#e2e8f0] mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ============================================
// MAIN LANDING PAGE
// ============================================

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('AS Graphic and Interactive Design')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [animatedSalary, setAnimatedSalary] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('signup')

  const openAuthModal = (mode: AuthMode) => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const targetSalary = 32000
    const duration = 2000
    const steps = 60
    const increment = targetSalary / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetSalary) {
        setAnimatedSalary(targetSalary)
        clearInterval(timer)
      } else {
        setAnimatedSalary(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-12 py-4 bg-[#020617]/80 backdrop-blur-lg border-b border-[#1e293b]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#ffc425] to-[#ffd768] flex items-center justify-center">
              <Zap size={18} className="text-[#020617]" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#e2e8f0]">
              Jalanea<span className="text-[#ffc425]">Works</span>
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:flex items-center gap-8"
          >
            <NavLink href="#why">Our Why</NavLink>
            <NavLink href="#business">Start a Business</NavLink>
            <NavLink href="#blog">Blog</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </motion.div>

          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex items-center gap-4"
          >
            <button
              onClick={() => openAuthModal('signin')}
              className="text-[#cbd5e1] font-medium hover:text-[#ffc425] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-primary py-2.5 px-5"
            >
              Get Started
            </button>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#e2e8f0]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0f172a]/95 backdrop-blur-lg rounded-2xl mt-4 p-6 border border-[#1e293b]"
            >
              <div className="flex flex-col gap-4">
                <a href="#why" className="text-[#e2e8f0] font-medium py-2 hover:text-[#ffc425]">Our Why</a>
                <a href="#business" className="text-[#e2e8f0] font-medium py-2 hover:text-[#ffc425]">Start a Business</a>
                <a href="#blog" className="text-[#e2e8f0] font-medium py-2 hover:text-[#ffc425]">Blog</a>
                <a href="#pricing" className="text-[#e2e8f0] font-medium py-2 hover:text-[#ffc425]">Pricing</a>
                <hr className="border-[#1e293b]" />
                <button
                  onClick={() => openAuthModal('signin')}
                  className="text-[#e2e8f0] font-medium py-2 hover:text-[#ffc425] text-left"
                >
                  Sign in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="btn-primary w-full justify-center"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - Responsive Layout */}
      <section className="pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            {/* Left Content */}
            <div className="lg:pt-4">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="badge mb-4 sm:mb-6"
              >
                <Zap size={14} className="text-[#ffc425]" />
                <span>Lightning, it works!</span>
              </motion.div>

              {/* Headline - Responsive sizing */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="headline text-[#e2e8f0] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mb-4 sm:mb-6"
              >
                The Entry-Level<br />
                Job Market,{' '}
                <span className="gradient-text gold-glow">Solved.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-lg sm:text-xl lg:text-2xl text-[#e2e8f0] font-semibold mb-3 sm:mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                For Community College Grads.
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base lg:text-lg text-[#94a3b8] mb-6 sm:mb-8 max-w-lg leading-relaxed"
              >
                Stop applying to &quot;entry-level&quot; jobs that want 3 years of experience. We match you with employers specifically looking for{' '}
                <strong className="text-[#e2e8f0]">your degree and fresh talent.</strong>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                <button
                  onClick={() => openAuthModal('signup')}
                  className="btn-primary text-sm sm:text-base py-3 sm:py-4 px-5 sm:px-6"
                >
                  <Zap size={18} />
                  Match My Degree
                </button>
                <button className="btn-outline text-sm sm:text-base py-3 sm:py-4 px-5 sm:px-6">
                  Our Mission
                </button>
              </motion.div>
            </div>

            {/* Right - Calculator Card - Responsive with proper padding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-4 lg:mt-0"
            >
              <div className="glass-card p-4 sm:p-6 lg:p-8">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Live Career Mapping
                  </span>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-green-400">
                    <span className="live-dot" />
                    Analysis Active
                  </div>
                </div>

                {/* Search Input */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-2 sm:mb-3">
                    Type your degree or certificate
                  </label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input text-sm sm:text-base py-2.5 sm:py-3 pl-9 sm:pl-12 pr-9 sm:pr-12"
                      placeholder="e.g., AS Computer Science"
                    />
                    <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#1e293b] rounded-lg transition-colors">
                      <X size={14} className="text-[#64748b]" />
                    </button>
                  </div>
                </div>

                {/* Arrow divider */}
                <div className="flex justify-center my-3 sm:my-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#ffc425] to-[#ffd768] flex items-center justify-center shadow-lg shadow-[#ffc425]/20">
                    <ChevronDown size={18} className="text-[#020617]" />
                  </div>
                </div>

                {/* Results */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-2 sm:mb-3">
                    Qualified Entry-Level Roles
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {sampleRoles.map((role, index) => (
                      <motion.div
                        key={role.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                        className="role-card cursor-pointer py-2.5 sm:py-3 px-3 sm:px-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ffc425]/10 border border-[#ffc425]/20 flex items-center justify-center text-[#ffc425]">
                            {role.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[#e2e8f0] text-xs sm:text-sm truncate">{role.title}</div>
                            <div className="text-[10px] sm:text-xs text-[#64748b]">{role.salary}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="text-sm sm:text-lg font-bold text-[#ffc425]">{role.match}%</div>
                          <div className="progress-bar w-12 sm:w-16 mt-1">
                            <motion.div
                              className="progress-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${role.match}%` }}
                              transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0f172a]/50 rounded-xl border border-[#1e293b] mb-3 sm:mb-4">
                  <div className="text-center border-r border-[#1e293b]">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#64748b] mb-1">Est. Salary Bump</div>
                    <div className="text-lg sm:text-2xl font-bold text-[#ffc425]">
                      +${animatedSalary.toLocaleString()}<span className="text-[10px] sm:text-sm font-normal text-[#94a3b8]">/yr</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#64748b] mb-1">Open Local Roles</div>
                    <div className="text-lg sm:text-2xl font-bold text-[#e2e8f0]">124</div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full btn-primary justify-center py-3 sm:py-4 text-sm sm:text-base"
                >
                  Unlock These Opportunities
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12 border-y border-[#1e293b]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-[#64748b] uppercase tracking-wider text-xs sm:text-sm font-medium">
              Trusted by Valencia College graduates
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            <StatCard value="2,400+" label="Jobs Matched" delay={100} />
            <StatCard value="89%" label="Placement Rate" delay={200} />
            <StatCard value="$48k" label="Avg Starting Salary" delay={300} />
            <StatCard value="21 days" label="Avg Time to Hire" delay={400} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="headline text-[#e2e8f0] text-3xl sm:text-4xl lg:text-6xl mb-3 sm:mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#94a3b8] max-w-2xl mx-auto">
              From credentials to career in three simple steps. No more endless scrolling through job boards.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={<Search size={24} className="text-[#ffc425]" />}
              title="Enter Your Credentials"
              description="Add your degree, certificates, and skills. Our AI analyzes your unique qualification profile."
              index={0}
            />
            <FeatureCard
              icon={<Sparkles size={24} className="text-[#ffc425]" />}
              title="Get Matched Instantly"
              description="Receive personalized job matches with salary estimates and compatibility scores in seconds."
              index={1}
            />
            <FeatureCard
              icon={<Clock size={24} className="text-[#ffc425]" />}
              title="Apply Smarter"
              description="We send 3 quality applications daily on your behalf. Track progress and get interview prep."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-[#0f172a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="badge mb-4 sm:mb-6">
                <Users size={14} className="text-[#ffc425]" />
                <span>Community Impact</span>
              </div>
              <h2 className="headline text-[#e2e8f0] text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6">
                Build careers.<br />
                Build community.<br />
                <span className="gradient-text">Build home.</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-[#94a3b8] mb-6 sm:mb-8 leading-relaxed">
                JalaneaWorks is more than a job platform. We&apos;re part of the Jalanea: Light the Block movement,
                connecting Orlando graduates to local opportunities and strengthening our community from within.
              </p>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 text-[#cbd5e1]">
                  <Shield size={18} className="text-[#ffc425]" />
                  <span className="font-medium text-sm sm:text-base">Vetted employers</span>
                </div>
                <div className="flex items-center gap-2 text-[#cbd5e1]">
                  <TrendingUp size={18} className="text-[#ffc425]" />
                  <span className="font-medium text-sm sm:text-base">Career growth focus</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="glass-card p-6 sm:p-8 lg:p-12">
                <div className="text-5xl sm:text-6xl lg:text-8xl font-bold gradient-text mb-2">94%</div>
                <div className="text-base sm:text-lg lg:text-xl text-[#94a3b8] mb-4 sm:mb-6">of users rate their experience as &quot;life-changing&quot;</div>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1e293b] to-[#334155] border-4 border-[#0f172a] flex items-center justify-center text-[#ffc425] font-bold text-xs sm:text-sm"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#ffc425] to-[#ffd768] border-4 border-[#0f172a] flex items-center justify-center text-[#020617] font-bold text-xs sm:text-sm">
                    +99
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="headline text-[#e2e8f0] text-3xl sm:text-4xl lg:text-6xl mb-4 sm:mb-6">
              Ready to start your <span className="gradient-text">career?</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#94a3b8] mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of Valencia College graduates who found their dream jobs through JalaneaWorks.
              Your future is just one click away.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <button
                onClick={() => openAuthModal('signup')}
                className="btn-primary text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                Get Started Free
                <ArrowRight size={18} />
              </button>
              <button className="btn-outline text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4">
                See Pricing Plans
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#64748b] mt-4 sm:mt-6">
              No credit card required &bull; Free for Valencia students
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-12 border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#ffc425] to-[#ffd768] flex items-center justify-center">
                <Zap size={16} className="text-[#020617]" />
              </div>
              <span className="text-base sm:text-lg font-bold text-[#e2e8f0]">
                Jalanea<span className="text-[#ffc425]">Works</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm">
              <a href="#" className="text-[#94a3b8] hover:text-[#ffc425] transition-colors">Privacy Policy</a>
              <a href="#" className="text-[#94a3b8] hover:text-[#ffc425] transition-colors">Terms of Service</a>
              <a href="#" className="text-[#94a3b8] hover:text-[#ffc425] transition-colors">Contact Us</a>
              <a href="#" className="text-[#94a3b8] hover:text-[#ffc425] transition-colors">Blog</a>
            </div>
            <div className="text-xs sm:text-sm text-[#64748b]">
              &copy; 2024 JalaneaWorks. Part of the Light the Block movement.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
