'use client'

/**
 * PocketTier3 - Premium tier pocket display (5-10 min read)
 * Full 8-page intelligence report with all insights
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Building2,
  Target,
  Users,
  Star,
  Sparkles,
  TrendingUp,
  MessageSquare,
  FileText,
  DollarSign,
  Award,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Compass,
  Shield,
  Clock
} from 'lucide-react'
import { PocketTier2, type PocketTier2Data } from './PocketTier2'

export interface CompanyResearch {
  overview: string
  culture: string
  recentNews: string[]
  glassdoorRating?: number
  interviewProcess: string
}

export interface SalaryIntel {
  marketRate: string
  negotiationTips: string[]
  totalCompEstimate: string
}

export interface InterviewPrep {
  behavioralQuestions: string[]
  technicalQuestions: string[]
  questionsToAsk: string[]
  interviewTips: string[]
}

export interface CareerPath {
  shortTerm: string
  mediumTerm: string
  longTerm: string
  skillsToDevlop: string[]
}

export interface PocketTier3Data extends PocketTier2Data {
  companyResearch: CompanyResearch
  salaryIntel: SalaryIntel
  interviewPrep: InterviewPrep
  careerPath: CareerPath
  competitorAnalysis: string
  networkingTips: string[]
  dayInLife: string
  successMetrics: string[]
}

interface PocketTier3Props {
  data: PocketTier3Data
  jobTitle?: string
  companyName?: string
}

interface PageProps {
  children: React.ReactNode
  title: string
  icon: React.ElementType
  pageNumber: number
  totalPages: number
}

function Page({ children, title, icon: Icon, pageNumber, totalPages }: PageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-[500px]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-xl font-bold text-white">
          <div className="w-10 h-10 rounded-xl bg-[#ffc425]/20 flex items-center justify-center">
            <Icon size={20} className="text-[#ffc425]" />
          </div>
          {title}
        </h2>
        <span className="text-sm text-slate-500">
          Page {pageNumber} of {totalPages}
        </span>
      </div>
      {children}
    </motion.div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  className = ''
}: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
        {Icon && <Icon size={16} className="text-blue-400" />}
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoCard({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'highlight' | 'warning' }) {
  const variants = {
    default: 'bg-slate-800/50 border-slate-700',
    highlight: 'bg-blue-500/10 border-blue-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30'
  }

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]}`}>
      {children}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? 'text-[#ffc425] fill-[#ffc425]' : 'text-slate-600'}
        />
      ))}
      <span className="ml-2 text-white font-semibold">{rating.toFixed(1)}</span>
    </div>
  )
}

export function PocketTier3({ data, jobTitle, companyName }: PocketTier3Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 8

  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages))
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1))

  // Extract Tier 2 data
  const tier2Data: PocketTier2Data = {
    qualificationCheck: data.qualificationCheck,
    quickBrief: data.quickBrief,
    talkingPoints: data.talkingPoints,
    likelyQuestions: data.likelyQuestions,
    redFlags: data.redFlags,
    recommendation: data.recommendation,
    roleBreakdown: data.roleBreakdown,
    whyHiring: data.whyHiring,
    whatTheyWant: data.whatTheyWant,
    cultureCheck: data.cultureCheck,
    yourPositioning: data.yourPositioning
  }

  return (
    <div className="space-y-6">
      {/* Page navigation header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#ffc425] text-[#0f172a]'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Premium badge */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-[#0f172a] text-sm text-purple-400 font-semibold flex items-center gap-2">
            <Award size={16} />
            Premium Intelligence Report
          </span>
        </div>
      </div>

      {/* Page content */}
      <AnimatePresence mode="wait">
        {currentPage === 1 && (
          <Page key="1" title="Executive Summary" icon={FileText} pageNumber={1} totalPages={totalPages}>
            <PocketTier2 data={tier2Data} />
          </Page>
        )}

        {currentPage === 2 && (
          <Page key="2" title="Company Deep Dive" icon={Building2} pageNumber={2} totalPages={totalPages}>
            <div className="space-y-6">
              <Section title="Company Overview" icon={Compass}>
                <InfoCard>
                  <p className="text-slate-300 leading-relaxed">{data.companyResearch.overview}</p>
                </InfoCard>
              </Section>

              <Section title="Company Culture" icon={Users}>
                <InfoCard>
                  <p className="text-slate-300 leading-relaxed">{data.companyResearch.culture}</p>
                </InfoCard>
              </Section>

              {data.companyResearch.glassdoorRating && (
                <Section title="Employee Satisfaction" icon={Star}>
                  <InfoCard variant="highlight">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Glassdoor Rating</span>
                      <StarRating rating={data.companyResearch.glassdoorRating} />
                    </div>
                  </InfoCard>
                </Section>
              )}

              <Section title="Recent News" icon={TrendingUp}>
                <div className="space-y-2">
                  {data.companyResearch.recentNews.map((news, i) => (
                    <InfoCard key={i}>
                      <p className="text-slate-300 text-sm">{news}</p>
                    </InfoCard>
                  ))}
                </div>
              </Section>
            </div>
          </Page>
        )}

        {currentPage === 3 && (
          <Page key="3" title="Salary Intelligence" icon={DollarSign} pageNumber={3} totalPages={totalPages}>
            <div className="space-y-6">
              <Section title="Market Rate Analysis" icon={TrendingUp}>
                <InfoCard variant="highlight">
                  <p className="text-blue-300 leading-relaxed text-lg">{data.salaryIntel.marketRate}</p>
                </InfoCard>
              </Section>

              <Section title="Total Compensation Estimate" icon={Award}>
                <InfoCard>
                  <p className="text-slate-300 leading-relaxed">{data.salaryIntel.totalCompEstimate}</p>
                </InfoCard>
              </Section>

              <Section title="Negotiation Strategies" icon={MessageSquare}>
                <div className="space-y-2">
                  {data.salaryIntel.negotiationTips.map((tip, i) => (
                    <InfoCard key={i}>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-slate-300 text-sm">{tip}</p>
                      </div>
                    </InfoCard>
                  ))}
                </div>
              </Section>
            </div>
          </Page>
        )}

        {currentPage === 4 && (
          <Page key="4" title="Interview Preparation" icon={MessageSquare} pageNumber={4} totalPages={totalPages}>
            <div className="space-y-6">
              <Section title="Behavioral Questions" icon={Users}>
                <div className="space-y-2">
                  {data.interviewPrep.behavioralQuestions.map((q, i) => (
                    <InfoCard key={i}>
                      <p className="text-slate-300 text-sm">&quot;{q}&quot;</p>
                    </InfoCard>
                  ))}
                </div>
              </Section>

              <Section title="Technical Questions" icon={Lightbulb}>
                <div className="space-y-2">
                  {data.interviewPrep.technicalQuestions.map((q, i) => (
                    <InfoCard key={i}>
                      <p className="text-slate-300 text-sm">&quot;{q}&quot;</p>
                    </InfoCard>
                  ))}
                </div>
              </Section>
            </div>
          </Page>
        )}

        {currentPage === 5 && (
          <Page key="5" title="Questions to Ask" icon={BookOpen} pageNumber={5} totalPages={totalPages}>
            <div className="space-y-6">
              <Section title="Impress Your Interviewer" icon={Star}>
                <p className="text-slate-400 text-sm mb-4">
                  These thoughtful questions show you&apos;ve done your research and are genuinely interested in the role.
                </p>
                <div className="space-y-2">
                  {data.interviewPrep.questionsToAsk.map((q, i) => (
                    <InfoCard key={i} variant="highlight">
                      <p className="text-blue-300 text-sm">&quot;{q}&quot;</p>
                    </InfoCard>
                  ))}
                </div>
              </Section>

              <Section title="Interview Tips" icon={Lightbulb}>
                <div className="space-y-2">
                  {data.interviewPrep.interviewTips.map((tip, i) => (
                    <InfoCard key={i}>
                      <div className="flex items-start gap-3">
                        <Sparkles size={16} className="text-[#ffc425] flex-shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-sm">{tip}</p>
                      </div>
                    </InfoCard>
                  ))}
                </div>
              </Section>
            </div>
          </Page>
        )}

        {currentPage === 6 && (
          <Page key="6" title="Career Growth Path" icon={TrendingUp} pageNumber={6} totalPages={totalPages}>
            <div className="space-y-6">
              <div className="grid gap-4">
                <InfoCard>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={18} className="text-green-400" />
                    <span className="font-semibold text-green-400">Short Term (0-1 years)</span>
                  </div>
                  <p className="text-slate-300">{data.careerPath.shortTerm}</p>
                </InfoCard>

                <InfoCard>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={18} className="text-blue-400" />
                    <span className="font-semibold text-blue-400">Medium Term (1-3 years)</span>
                  </div>
                  <p className="text-slate-300">{data.careerPath.mediumTerm}</p>
                </InfoCard>

                <InfoCard>
                  <div className="flex items-center gap-3 mb-2">
                    <Clock size={18} className="text-purple-400" />
                    <span className="font-semibold text-purple-400">Long Term (3-5+ years)</span>
                  </div>
                  <p className="text-slate-300">{data.careerPath.longTerm}</p>
                </InfoCard>
              </div>

              <Section title="Skills to Develop" icon={Award}>
                <div className="flex flex-wrap gap-2">
                  {data.careerPath.skillsToDevlop.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            </div>
          </Page>
        )}

        {currentPage === 7 && (
          <Page key="7" title="Day in the Life" icon={Briefcase} pageNumber={7} totalPages={totalPages}>
            <div className="space-y-6">
              <Section title={`What to Expect as a ${jobTitle || 'Professional'}`} icon={Clock}>
                <InfoCard>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{data.dayInLife}</p>
                </InfoCard>
              </Section>

              <Section title="Interview Process" icon={Users}>
                <InfoCard variant="highlight">
                  <p className="text-blue-300 leading-relaxed">{data.companyResearch.interviewProcess}</p>
                </InfoCard>
              </Section>

              <Section title="Success Metrics" icon={Target}>
                <p className="text-slate-400 text-sm mb-3">
                  Key performance indicators typically measured in this role:
                </p>
                <div className="space-y-2">
                  {data.successMetrics.map((metric, i) => (
                    <InfoCard key={i}>
                      <div className="flex items-start gap-3">
                        <Shield size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-sm">{metric}</p>
                      </div>
                    </InfoCard>
                  ))}
                </div>
              </Section>
            </div>
          </Page>
        )}

        {currentPage === 8 && (
          <Page key="8" title="Competitive Edge" icon={Shield} pageNumber={8} totalPages={totalPages}>
            <div className="space-y-6">
              <Section title="Competitor Analysis" icon={Target}>
                <InfoCard>
                  <p className="text-slate-300 leading-relaxed">{data.competitorAnalysis}</p>
                </InfoCard>
              </Section>

              <Section title="Networking Tips" icon={Users}>
                <p className="text-slate-400 text-sm mb-3">
                  Ways to stand out and build connections at {companyName || 'this company'}:
                </p>
                <div className="space-y-2">
                  {data.networkingTips.map((tip, i) => (
                    <InfoCard key={i} variant="highlight">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-blue-300 text-sm">{tip}</p>
                      </div>
                    </InfoCard>
                  ))}
                </div>
              </Section>

              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Award size={24} className="text-purple-400" />
                  <h3 className="text-lg font-bold text-white">You&apos;re Ready!</h3>
                </div>
                <p className="text-slate-300">
                  You now have everything you need to make a strong impression.
                  Go ace that interview and land your dream job!
                </p>
              </div>
            </div>
          </Page>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PocketTier3
