import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavRoute } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
    ArrowLeft, ArrowRight, Calendar, Clock, User, Share2,
    Bookmark, CheckCircle2, ExternalLink, Sparkles, Lightbulb,
    MapPin, DollarSign, Briefcase, GraduationCap, Building2, Rocket
} from 'lucide-react';
import { blogArticles, BlogArticle as BlogArticleType } from './Blog';

interface BlogArticleProps {
    setRoute: (route: NavRoute) => void;
}

// Article content by slug
const articleContent: Record<string, {
    sections: {
        heading?: string;
        content: string[];
        list?: string[];
        callout?: { type: 'tip' | 'important' | 'note'; text: string };
        cta?: { text: string; link: string };
    }[];
}> = {
    'jobs-after-valencia-college-guide-2025': {
        sections: [
            {
                content: [
                    "Congratulations – you're about to graduate from Valencia College! Whether you're finishing an AS in Graphic Design, Computer Programming, Business Administration, or any other program, you're probably wondering: what's next?",
                    "This guide covers everything Valencia grads need to know about landing their first career job in Orlando in 2025."
                ]
            },
            {
                heading: "What Jobs Can You Get with a Valencia Degree?",
                content: [
                    "Valencia College offers over 100 degree and certificate programs, and each one opens doors to specific career paths. Here are some of the most in-demand career matches:"
                ],
                list: [
                    "AS Graphic and Interactive Design → Junior Web Designer ($52k-$65k), UI Support Specialist ($48k-$58k)",
                    "AS Computer Programming & Analysis → Junior Software Developer ($60k-$75k), QA Analyst ($55k-$68k)",
                    "AS Business Administration → Business Operations Associate ($45k-$55k), Sales Development Rep ($50k-$70k)",
                    "AS Cyber Security → SOC Analyst Level 1 ($65k-$80k), Network Administrator ($60k-$75k)",
                    "AS Hospitality & Tourism → Guest Experience Manager ($48k-$58k), Event Coordinator ($45k-$55k)"
                ]
            },
            {
                heading: "Where to Find Entry-Level Jobs in Orlando",
                content: [
                    "Orlando's job market is thriving, especially in tech, hospitality, healthcare, and creative industries. Here's where to look:"
                ],
                list: [
                    "Jalanea Works – Built specifically for Valencia grads, matches your degree to entry-level roles",
                    "Indeed & LinkedIn – Filter for 'Entry Level' and 'Orlando, FL'",
                    "Valencia Career Center – Free career counseling and job board access",
                    "Orlando Tech Association – Tech-specific job listings and networking events",
                    "Direct company websites – Disney, Universal, AdventHealth, Lockheed Martin"
                ],
                callout: { type: 'tip', text: "Use Jalanea Works to automatically match your Valencia degree to qualified positions – it filters out jobs requiring 3+ years of experience." }
            },
            {
                heading: "Resume Tips for Valencia Grads",
                content: [
                    "Your resume is your first impression. Here's how to make it count:"
                ],
                list: [
                    "Lead with your degree – 'Associate of Science in [Your Program], Valencia College'",
                    "Include relevant coursework – List 3-5 courses that directly relate to the job",
                    "Highlight projects – Capstone projects, portfolio pieces, and group work count as experience",
                    "Add certifications – Any industry certifications from your program (Adobe, CompTIA, etc.)",
                    "Quantify achievements – 'Designed 12 client projects' is better than 'Did design work'"
                ]
            },
            {
                heading: "Salary Expectations for Entry-Level Roles",
                content: [
                    "Orlando's cost of living is lower than major tech hubs, but salaries are competitive for entry-level positions:"
                ],
                list: [
                    "Tech/IT roles: $50,000 - $75,000",
                    "Design/Creative roles: $42,000 - $60,000",
                    "Business/Admin roles: $38,000 - $55,000",
                    "Healthcare support: $35,000 - $50,000",
                    "Hospitality management: $40,000 - $58,000"
                ],
                callout: { type: 'important', text: "Don't accept the first offer without negotiating. Even a $2,000 increase adds up to $40,000+ over your career." }
            },
            {
                heading: "Next Steps: Your Action Plan",
                content: [
                    "Ready to land your first career job? Here's your 30-day action plan:"
                ],
                list: [
                    "Week 1: Update your resume using the tips above, create/update your LinkedIn profile",
                    "Week 2: Sign up for Jalanea Works and complete your profile with your Valencia degree",
                    "Week 3: Apply to 3 jobs per day using Jalanea Works' curated matches",
                    "Week 4: Follow up on applications, practice interview questions, attend any networking events"
                ],
                cta: { text: "Start Finding Jobs Now", link: "/jobs" }
            }
        ]
    },
    'how-to-start-business-orlando': {
        sections: [
            {
                content: [
                    "What if instead of finding a job, you created jobs? Starting a business in Orlando is more accessible than you might think – and Valencia grads have the skills to make it happen.",
                    "This step-by-step guide covers everything you need to know about launching your own business in Central Florida."
                ]
            },
            {
                heading: "Why Start a Business in Orlando?",
                content: [
                    "Orlando isn't just for tourists. It's becoming a serious hub for startups and small businesses:"
                ],
                list: [
                    "Lower cost of living than major tech hubs (SF, NYC, Austin)",
                    "Growing tech ecosystem with Starter Studio, UCF incubator, and more",
                    "Tourism economy creates endless B2B opportunities",
                    "No state income tax in Florida",
                    "Your money stays in the community – 68% of local business revenue circulates locally"
                ],
                callout: { type: 'note', text: "When you start a local business, you're not just building wealth for yourself – you're creating jobs for people like you and keeping money in Orlando." }
            },
            {
                heading: "Step 1: Choose Your Business Structure",
                content: [
                    "Most small business owners in Florida start with an LLC (Limited Liability Company). Here's why:"
                ],
                list: [
                    "Personal asset protection – Your personal savings/property are separate from business debts",
                    "Tax flexibility – Can be taxed as sole proprietor, partnership, or S-corp",
                    "Credibility – Looks more professional than operating as an individual",
                    "Simple to set up – Only $125 filing fee in Florida"
                ]
            },
            {
                heading: "Step 2: Register Your LLC ($125)",
                content: [
                    "Here's exactly how to file your LLC in Florida:"
                ],
                list: [
                    "Go to Sunbiz.org (Florida Division of Corporations)",
                    "Click 'Start a Business' → 'Florida Limited Liability Company'",
                    "Choose a unique business name (check availability first)",
                    "File Articles of Organization online ($125 fee)",
                    "Receive confirmation within 1-2 business days"
                ],
                cta: { text: "Go to Sunbiz.org", link: "https://sunbiz.org" }
            },
            {
                heading: "Step 3: Get Your EIN (Free)",
                content: [
                    "An EIN (Employer Identification Number) is like a Social Security number for your business. You need this to:"
                ],
                list: [
                    "Open a business bank account",
                    "Hire employees",
                    "File business taxes",
                    "Apply for business credit"
                ],
                callout: { type: 'tip', text: "Get your EIN instantly at IRS.gov – it's completely free and takes about 5 minutes online." }
            },
            {
                heading: "Step 4: Get Free Help from Orlando Resources",
                content: [
                    "You don't have to figure this out alone. These Orlando organizations offer FREE support:"
                ],
                list: [
                    "Florida SBDC at UCF – Free business consulting and workshops (floridasbdc.org)",
                    "SCORE Orlando – Free mentorship from experienced entrepreneurs (score.org/orlando)",
                    "Starter Studio – Startup accelerator and coworking space (starterstudio.org)",
                    "City of Orlando Small Business Hub – Permits, licensing help"
                ]
            },
            {
                heading: "Step 5: Find Funding (Grants & Loans)",
                content: [
                    "Orlando has several grant programs for new businesses – money you don't have to pay back:"
                ],
                list: [
                    "Orange County Microbusiness Grant – Up to $10,000 for businesses with <5 employees",
                    "Black Business Investment Fund (BBIF) – Various amounts for Black-owned businesses",
                    "SBA Community Advantage – Up to $350,000 for businesses in low-income areas"
                ],
                cta: { text: "Explore All Resources", link: "/entrepreneur" }
            },
            {
                heading: "Total Startup Cost: $150-$300",
                content: [
                    "Here's the breakdown of what it actually costs to start a legit business in Florida:"
                ],
                list: [
                    "LLC filing: $125",
                    "EIN: FREE",
                    "Business bank account: $0-$25",
                    "City/county permits: Varies ($0-$100)",
                    "Total: ~$150-$300"
                ],
                callout: { type: 'important', text: "Don't let anyone tell you it costs thousands to start a business. The legal structure is cheap – you're paying for your time and hustle." }
            }
        ]
    },
    'staying-hometown-power-move': {
        sections: [
            {
                content: [
                    "Here's a story you've heard before: Smart kid from a modest neighborhood gets an education, lands a big job in San Francisco or New York, and 'makes it.' Success story, right?",
                    "But here's what nobody talks about: That $150,000 salary in SF? It's building up a city that was already rich. Meanwhile, the neighborhood that raised them stays exactly the same.",
                    "What if there's another path? What if staying home isn't settling – it's a power move?"
                ]
            },
            {
                heading: "The 'Brain Drain' Problem Nobody Talks About",
                content: [
                    "When talented graduates leave their hometowns, economists call it 'brain drain.' Here's what it actually costs communities:"
                ],
                list: [
                    "Lost tax revenue – Your income taxes would fund local schools, roads, and services",
                    "Fewer local businesses – You could have started a company that created local jobs",
                    "Weakened networks – Other talented people follow you out, compounding the loss",
                    "Perpetuated poverty – The cycle continues for the next generation"
                ],
                callout: { type: 'note', text: "Every year, Orlando loses graduates to 'better opportunities' elsewhere. But who's building the better opportunities here?" }
            },
            {
                heading: "The Numbers: Where Your Money Actually Goes",
                content: [
                    "Here's something that changed how I think about career decisions:"
                ],
                list: [
                    "Money spent at local businesses: 68% stays in the community",
                    "Money spent at national chains: 43% stays local",
                    "Money sent to landlords in SF/NYC: 0% comes back to Orlando"
                ]
            },
            {
                heading: "What 'Success' Could Look Like Instead",
                content: [
                    "Imagine this alternative path:"
                ],
                list: [
                    "You graduate from Valencia with a design degree",
                    "Instead of chasing agency jobs in Austin, you start a branding studio on Mills Ave",
                    "You hire two other Valencia grads within a year",
                    "Your clients are Orlando restaurants, startups, and attractions",
                    "Your employees buy houses in Orlando, spend money in Orlando, raise kids in Orlando",
                    "In 10 years, you've created a $2M+ local economic impact – just from your business"
                ],
                callout: { type: 'important', text: "This isn't a fantasy. There are Valencia grads doing exactly this right now. The question is: could you be one of them?" }
            },
            {
                heading: "But What About Lower Salaries?",
                content: [
                    "Let's address this directly. Yes, Orlando salaries are lower than SF or NYC. But consider:"
                ],
                list: [
                    "Cost of living is 40-60% lower than major tech hubs",
                    "No state income tax in Florida (California takes 9-13%)",
                    "You can buy a house here – try that in SF on an entry-level salary",
                    "Quality of life: Less commute, more space, near family",
                    "Building equity in a community that will recognize your contributions"
                ]
            },
            {
                heading: "The Jalanea: Light the Block Movement",
                content: [
                    "This is why we built Jalanea Works. We're not just another job board. We're a movement.",
                    "We believe that the smartest people from the hardest places should have every opportunity to build where they belong. We believe that 'staying home' is a power move, not a consolation prize."
                ],
                list: [
                    "We prioritize local Orlando employers",
                    "We offer an 'Entrepreneur Track' for starting your own business",
                    "We reinvest 30% of revenue back into community grants",
                    "We're building proof that this model works – so other cities can follow"
                ],
                cta: { text: "Join the Movement", link: "/mission" }
            },
            {
                heading: "Your Choice Matters",
                content: [
                    "Here's the truth: Nobody can make this decision for you. If the right opportunity is in another city, take it. No shame in that.",
                    "But if you have options? If you could build something here instead of there? Consider what your choice means – not just for you, but for everyone who comes after you.",
                    "You could be the person who stayed. The person who built. The person who proved it could be done.",
                    "That's a power move."
                ],
                cta: { text: "Start Building Here", link: "/jobs" }
            }
        ]
    }
};

const CalloutBox: React.FC<{ type: 'tip' | 'important' | 'note'; text: string }> = ({ type, text }) => {
    const styles = {
        tip: 'bg-green-50 border-green-500 text-green-800',
        important: 'bg-amber-50 border-gold text-amber-900',
        note: 'bg-blue-50 border-blue-500 text-blue-800'
    };
    const icons = {
        tip: <Lightbulb size={18} />,
        important: <Sparkles size={18} />,
        note: <Bookmark size={18} />
    };
    const labels = {
        tip: 'Pro Tip',
        important: 'Important',
        note: 'Note'
    };

    return (
        <div className={`p-4 rounded-xl border-l-4 ${styles[type]} my-6`}>
            <div className="flex items-center gap-2 font-bold mb-1 text-sm">
                {icons[type]}
                {labels[type]}
            </div>
            <p className="text-sm">{text}</p>
        </div>
    );
};

export const BlogArticlePage: React.FC<BlogArticleProps> = ({ setRoute }) => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();

    const article = blogArticles.find(a => a.slug === slug);
    const content = slug ? articleContent[slug] : null;

    if (!article || !content) {
        return (
            <div className="min-h-screen bg-jalanea-50 flex items-center justify-center">
                <Card variant="solid-white" className="text-center p-8">
                    <h1 className="text-2xl font-bold text-jalanea-900 mb-4">Article Not Found</h1>
                    <p className="text-jalanea-600 mb-6">The article you're looking for doesn't exist.</p>
                    <Button variant="primary" onClick={() => navigate('/blog')}>
                        <ArrowLeft size={16} /> Back to Blog
                    </Button>
                </Card>
            </div>
        );
    }

    const categoryColors: Record<string, string> = {
        "Career Guide": "bg-blue-500/10 text-blue-600 border-blue-500/20",
        "Entrepreneurship": "bg-gold/10 text-amber-700 border-gold/20",
        "The Movement": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    };

    return (
        <div className="min-h-screen bg-jalanea-50">
            {/* Header */}
            <div className="bg-white border-b border-jalanea-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/blog')}
                        className="flex items-center gap-2 text-jalanea-600 hover:text-jalanea-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back to Blog</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-jalanea-100 rounded-full transition-colors">
                            <Bookmark size={18} className="text-jalanea-500" />
                        </button>
                        <button className="p-2 hover:bg-jalanea-100 rounded-full transition-colors">
                            <Share2 size={18} className="text-jalanea-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-4 py-12">
                {/* Meta */}
                <div className="mb-8">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 ${categoryColors[article.category]}`}>
                        {article.category}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-display font-bold text-jalanea-900 mb-4">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-jalanea-500">
                        <span className="flex items-center gap-1">
                            <User size={14} />
                            {article.author}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {article.readTime}
                        </span>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="prose prose-jalanea max-w-none">
                    {content.sections.map((section, i) => (
                        <div key={i} className="mb-8">
                            {section.heading && (
                                <h2 className="text-xl md:text-2xl font-bold text-jalanea-900 mt-10 mb-4">
                                    {section.heading}
                                </h2>
                            )}

                            {section.content.map((paragraph, j) => (
                                <p key={j} className="text-jalanea-700 leading-relaxed mb-4">
                                    {paragraph}
                                </p>
                            ))}

                            {section.list && (
                                <ul className="space-y-2 my-4">
                                    {section.list.map((item, k) => (
                                        <li key={k} className="flex items-start gap-3 text-jalanea-700">
                                            <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.callout && (
                                <CalloutBox type={section.callout.type} text={section.callout.text} />
                            )}

                            {section.cta && (
                                <div className="my-6">
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            if (section.cta!.link.startsWith('http')) {
                                                window.open(section.cta!.link, '_blank');
                                            } else {
                                                navigate(section.cta!.link);
                                            }
                                        }}
                                    >
                                        {section.cta.text} <ArrowRight size={16} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-jalanea-200">
                    <h4 className="text-sm font-bold text-jalanea-500 uppercase tracking-wider mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-jalanea-100 text-jalanea-600 text-sm rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-jalanea-900 to-jalanea-800 text-white p-8 rounded-2xl text-center">
                    <h3 className="text-xl font-bold mb-2">Ready to Take the Next Step?</h3>
                    <p className="text-jalanea-300 mb-6">Join Jalanea Works and find careers matched to your Valencia degree.</p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/jobs')}>
                        Explore Careers <ArrowRight size={18} />
                    </Button>
                </div>
            </article>

            {/* Footer */}
            <div className="bg-jalanea-100 py-8 px-4 text-center">
                <p className="text-sm text-jalanea-500">
                    Part of <span className="font-bold text-jalanea-700">Jalanea: Light the Block</span>
                </p>
            </div>
        </div>
    );
};
