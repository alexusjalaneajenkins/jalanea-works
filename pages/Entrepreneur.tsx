import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavRoute } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
    ArrowLeft, ArrowRight, Rocket, Building2, DollarSign, FileText,
    ExternalLink, Lightbulb, Users, CheckCircle2, MapPin, Palette,
    Code, Briefcase, Coffee, Sparkles, BookOpen, HandHeart
} from 'lucide-react';

interface EntrepreneurProps {
    setRoute: (route: NavRoute) => void;
}

// Resource data
const orlandoResources = [
    {
        name: "Florida SBDC at UCF",
        desc: "Free business consulting, workshops, market research",
        url: "https://floridasbdc.org",
        icon: Building2
    },
    {
        name: "SCORE Orlando",
        desc: "Free mentorship from experienced entrepreneurs",
        url: "https://score.org/orlando",
        icon: Users
    },
    {
        name: "Starter Studio",
        desc: "Startup accelerator, coworking, mentorship",
        url: "https://starterstudio.org",
        icon: Rocket
    },
    {
        name: "City of Orlando Small Business Hub",
        desc: "Permits, licensing, city contracts",
        url: "https://orlando.gov/smallbusiness",
        icon: FileText
    },
];

const grantPrograms = [
    {
        name: "Orange County Microbusiness Grant",
        amount: "Up to $10,000",
        who: "Businesses with <5 employees"
    },
    {
        name: "Black Business Investment Fund (BBIF)",
        amount: "Varies",
        who: "Black-owned businesses"
    },
    {
        name: "Florida First Capital Finance",
        amount: "Up to $150,000",
        who: "Small businesses (loans + some grants)"
    },
    {
        name: "SBA Community Advantage",
        amount: "Up to $350,000",
        who: "Low-income area businesses"
    },
];

const llcSteps = [
    { step: "Choose a business name", desc: "Check availability at sunbiz.org", cost: "Free" },
    { step: "File Articles of Organization", desc: "Online at Sunbiz", cost: "$125" },
    { step: "Get an EIN", desc: "Free from IRS.gov (takes 5 minutes)", cost: "Free" },
    { step: "Open a business bank account", desc: "Separates personal/business money", cost: "Free-$25" },
    { step: "Get local permits", desc: "Check Orlando Business Permits", cost: "Varies" },
    { step: "Register for Florida sales tax", desc: "If selling products", cost: "Free" },
];

const businessIdeas = [
    {
        degree: "Graphic & Interactive Design",
        ideas: ["Branding studio for local restaurants", "Social media agency for Orlando attractions", "UI/UX consulting for startups", "Print shop/signage for small businesses"],
        icon: Palette
    },
    {
        degree: "Computing & Software Development",
        ideas: ["Web development agency", "Tech support for local offices", "App development for service businesses", "IT consulting for healthcare/hospitality"],
        icon: Code
    },
    {
        degree: "Any Background",
        ideas: ["Event planning for tourism industry", "Tutoring/education services", "Food truck (lower startup than restaurant)", "Virtual assistant agency"],
        icon: Briefcase
    },
];

export const Entrepreneur: React.FC<EntrepreneurProps> = ({ setRoute }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-jalanea-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-gold via-amber-500 to-orange-500 text-jalanea-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                {/* Navigation */}
                <nav className="relative z-10 px-4 md:px-8 py-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-jalanea-800 hover:text-jalanea-950 transition-colors"
                        >
                            <div className="p-2 rounded-full bg-white/20 group-hover:bg-white group-hover:text-jalanea-950 transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            Back
                        </button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/jobs')}
                            className="bg-jalanea-900 text-white hover:bg-jalanea-800"
                        >
                            Find a Job Instead <ArrowRight size={16} />
                        </Button>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-24 md:pt-16 md:pb-32">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Rocket size={32} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">Start a Business</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
                        Don't Just Find a Job.<br />
                        <span className="text-jalanea-950">Create Jobs.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-jalanea-800 max-w-3xl leading-relaxed">
                        Every local business you start keeps money circulating in our community.
                        Here's everything you need to launch in Orlando.
                    </p>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-12 max-w-xl">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-bold">68%</div>
                            <div className="text-xs font-medium opacity-80">Revenue stays local</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-bold">$125</div>
                            <div className="text-xs font-medium opacity-80">LLC filing fee</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl md:text-3xl font-bold">FREE</div>
                            <div className="text-xs font-medium opacity-80">Consulting at SBDC</div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
                        <path d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,90.7C672,96,768,96,864,85.3C960,75,1056,53,1152,48C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#FAFCFB" />
                    </svg>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 space-y-20">

                {/* Orlando Resources */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-jalanea-100 rounded-lg">
                            <MapPin className="text-jalanea-700" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900">Free Orlando Resources</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {orlandoResources.map((resource, i) => (
                            <a
                                key={i}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <Card
                                    variant="solid-white"
                                    hoverEffect
                                    className="h-full flex items-start gap-4 group-hover:border-gold transition-colors"
                                >
                                    <div className="p-3 bg-jalanea-100 rounded-xl group-hover:bg-gold transition-colors shrink-0">
                                        <resource.icon size={24} className="text-jalanea-700 group-hover:text-jalanea-900" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-jalanea-900 flex items-center gap-2">
                                            {resource.name}
                                            <ExternalLink size={14} className="text-jalanea-400 group-hover:text-gold" />
                                        </h3>
                                        <p className="text-sm text-jalanea-600">{resource.desc}</p>
                                    </div>
                                </Card>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Grants & Funding */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="text-green-700" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900">Grants & Funding</h2>
                    </div>

                    <p className="text-jalanea-600 mb-6">
                        These programs provide grants (not loans) to help you start or grow your business:
                    </p>

                    <div className="space-y-3">
                        {grantPrograms.map((grant, i) => (
                            <div
                                key={i}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-white rounded-xl border border-jalanea-200"
                            >
                                <div>
                                    <h4 className="font-bold text-jalanea-900">{grant.name}</h4>
                                    <p className="text-sm text-jalanea-500">{grant.who}</p>
                                </div>
                                <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                                    {grant.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LLC Steps */}
                <section className="bg-jalanea-900 text-white -mx-4 md:-mx-8 px-4 md:px-8 py-16 rounded-3xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <FileText className="text-gold" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold">Start an LLC in Florida</h2>
                    </div>

                    <p className="text-jalanea-300 mb-8">
                        Total cost: <span className="text-gold font-bold">~$150-300</span>. Here's the step-by-step:
                    </p>

                    <div className="space-y-4">
                        {llcSteps.map((step, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                            >
                                <div className="w-8 h-8 rounded-full bg-gold text-jalanea-900 flex items-center justify-center font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-white">{step.step}</h4>
                                    <p className="text-sm text-jalanea-400">{step.desc}</p>
                                </div>
                                <div className="text-sm font-bold text-gold whitespace-nowrap">
                                    {step.cost}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="https://sunbiz.org"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="primary">
                                Go to Sunbiz.org <ExternalLink size={16} />
                            </Button>
                        </a>
                        <a
                            href="https://irs.gov"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                Get Free EIN <ExternalLink size={16} />
                            </Button>
                        </a>
                    </div>
                </section>

                {/* Business Ideas */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Lightbulb className="text-purple-700" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900">Business Ideas for Valencia Grads</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {businessIdeas.map((category, i) => (
                            <Card key={i} variant="glass-light" className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <category.icon size={20} className="text-jalanea-700" />
                                    </div>
                                    <h3 className="font-bold text-jalanea-900">{category.degree}</h3>
                                </div>
                                <ul className="space-y-2">
                                    {category.ideas.map((idea, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-jalanea-600">
                                            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                            {idea}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Coming Soon: Entrepreneur Track */}
                <section className="text-center bg-gradient-to-r from-gold/10 to-purple-100 -mx-4 md:-mx-8 px-4 md:px-8 py-16 rounded-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-jalanea-200 text-jalanea-700 text-sm font-bold mb-6">
                        <Sparkles size={16} />
                        Coming Soon
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-jalanea-900 mb-4">The Entrepreneur Track</h2>

                    <p className="text-lg text-jalanea-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        A guided path from idea to launch – right inside Jalanea Works. Discovery, validation,
                        formation, funding, and launch. All with AI-powered support and local mentor matching.
                    </p>

                    <Button variant="outline" size="lg" disabled className="opacity-50 cursor-not-allowed">
                        Join the Waitlist <ArrowRight size={18} />
                    </Button>
                </section>

                {/* Final CTA */}
                <section className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900 mb-4">
                        Not Ready to Start a Business?
                    </h2>
                    <p className="text-lg text-jalanea-600 mb-8">
                        That's okay! Find a great career first, then come back when you're ready.
                    </p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/jobs')}>
                        Explore Careers <ArrowRight size={18} />
                    </Button>
                </section>

            </div>

            {/* Footer */}
            <div className="bg-jalanea-100 py-8 px-4 md:px-8 text-center">
                <p className="text-sm text-jalanea-500">
                    Part of the <span className="font-bold text-jalanea-700">Jalanea: Light the Block</span> movement.
                    <button onClick={() => navigate('/mission')} className="text-gold font-bold ml-1 hover:underline">
                        Learn more →
                    </button>
                </p>
            </div>
        </div>
    );
};
