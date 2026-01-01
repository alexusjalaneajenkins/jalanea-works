import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavRoute } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
    ArrowLeft, ArrowRight, Sparkles, Users, Building2, TrendingUp,
    Heart, MapPin, DollarSign, GraduationCap, Lightbulb, Target,
    CheckCircle2, ExternalLink, HandHeart, Globe
} from 'lucide-react';

interface MissionProps {
    setRoute: (route: NavRoute) => void;
}

export const Mission: React.FC<MissionProps> = ({ setRoute }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-jalanea-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-jalanea-950 via-jalanea-900 to-jalanea-800 text-white overflow-hidden">
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
                            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-jalanea-400 hover:text-white transition-colors"
                        >
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-gold group-hover:text-jalanea-950 transition-all">
                                <ArrowLeft size={16} />
                            </div>
                            Back
                        </button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/jobs')}
                            className="gap-2"
                        >
                            Start Your Journey <ArrowRight size={16} />
                        </Button>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-24 md:pt-20 md:pb-32 text-center">
                    {/* Movement Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold mb-8">
                        <Sparkles size={16} />
                        Jalanea: Light the Block
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                        Build Careers.<br />
                        Build Community.<br />
                        <span className="text-gold">Build Home.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-jalanea-300 max-w-3xl mx-auto leading-relaxed">
                        We help first-generation college graduates build careers AND communities –
                        promoting local entrepreneurship, talent retention, and economic dignity
                        in the hometowns that raised them.
                    </p>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" className="w-full h-auto">
                        <path d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,90.7C672,96,768,96,864,85.3C960,75,1056,53,1152,48C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#FAFCFB" />
                    </svg>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 space-y-24">

                {/* The Problem Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <TrendingUp className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900">The Problem No One Talks About</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card variant="glass-light" className="border-l-4 border-l-red-500">
                            <h3 className="text-xl font-bold text-jalanea-900 mb-3 flex items-center gap-2">
                                <Target size={20} className="text-red-500" />
                                Brain Drain
                            </h3>
                            <p className="text-jalanea-600 leading-relaxed">
                                Every year, community colleges graduate brilliant minds from communities that never had much.
                                And what happens? <span className="font-bold text-jalanea-900">The best of us get shipped off.</span>
                            </p>
                            <p className="text-jalanea-600 leading-relaxed mt-3">
                                Google hires them. Amazon relocates them. All that potential – all that intelligence,
                                creativity, and drive – is building up a city that's already rich.
                                <span className="font-bold text-jalanea-900"> Meanwhile, our neighborhoods stay the same.</span>
                            </p>
                        </Card>

                        <Card variant="glass-light" className="border-l-4 border-l-orange-500">
                            <h3 className="text-xl font-bold text-jalanea-900 mb-3 flex items-center gap-2">
                                <DollarSign size={20} className="text-orange-500" />
                                Economic Leakage
                            </h3>
                            <p className="text-jalanea-600 leading-relaxed">
                                When money is spent at chain stores and corporations, ~70% of it leaves the community.
                                When it's spent at local businesses, ~68% stays.
                            </p>
                            <p className="text-jalanea-600 leading-relaxed mt-3">
                                But we don't have local businesses anymore. We have Walmarts and Old Navys
                                <span className="font-bold text-jalanea-900"> taking money out faster than we can make it.</span>
                            </p>
                        </Card>
                    </div>
                </section>

                {/* The Movement Section */}
                <section className="bg-jalanea-900 text-white -mx-4 md:-mx-8 px-4 md:px-8 py-16 md:py-20 rounded-3xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] -ml-36 -mb-36" />

                    <div className="relative z-10 text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold mb-6">
                            <Lightbulb size={16} />
                            The Movement
                        </div>

                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                            Jalanea: Light the Block
                        </h2>

                        <p className="text-xl md:text-2xl text-jalanea-300 leading-relaxed mb-8">
                            What if the smartest people from the hardest places
                            <span className="text-gold font-bold"> stayed to build where they belong?</span>
                        </p>

                        <div className="grid sm:grid-cols-3 gap-6 mt-12">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="text-jalanea-900" size={24} />
                                </div>
                                <h4 className="font-bold text-white mb-2">Find Careers</h4>
                                <p className="text-sm text-jalanea-400">Not just jobs – careers that grow with you, right here in Orlando.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Building2 className="text-jalanea-900" size={24} />
                                </div>
                                <h4 className="font-bold text-white mb-2">Start Businesses</h4>
                                <p className="text-sm text-jalanea-400">Create jobs for people like you. Keep wealth circulating locally.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Users className="text-jalanea-900" size={24} />
                                </div>
                                <h4 className="font-bold text-white mb-2">Build Community</h4>
                                <p className="text-sm text-jalanea-400">Connect with mentors who stayed and built. Your success IS community success.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Transparency Pledge */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gold/10 rounded-lg">
                            <HandHeart className="text-gold" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900">Transparency Pledge</h2>
                    </div>

                    <p className="text-lg text-jalanea-600 mb-8">
                        When Jalanea Works generates revenue, here's exactly where it goes:
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card variant="solid-white" className="text-center border-t-4 border-t-jalanea-600">
                            <div className="text-4xl font-bold text-jalanea-900 mb-2">40%</div>
                            <h4 className="font-bold text-jalanea-700 mb-1">Platform & Operations</h4>
                            <p className="text-sm text-jalanea-500">Keeping the lights on and improving features</p>
                        </Card>
                        <Card variant="solid-white" className="text-center border-t-4 border-t-gold">
                            <div className="text-4xl font-bold text-gold mb-2">30%</div>
                            <h4 className="font-bold text-jalanea-700 mb-1">Community Fund</h4>
                            <p className="text-sm text-jalanea-500">Grants for local businesses started by Valencia grads</p>
                        </Card>
                        <Card variant="solid-white" className="text-center border-t-4 border-t-purple-500">
                            <div className="text-4xl font-bold text-purple-600 mb-2">20%</div>
                            <h4 className="font-bold text-jalanea-700 mb-1">Expansion</h4>
                            <p className="text-sm text-jalanea-500">Replicating this model in other cities</p>
                        </Card>
                        <Card variant="solid-white" className="text-center border-t-4 border-t-green-500">
                            <div className="text-4xl font-bold text-green-600 mb-2">10%</div>
                            <h4 className="font-bold text-jalanea-700 mb-1">Scholarships</h4>
                            <p className="text-sm text-jalanea-500">Cover premium costs for Pell Grant recipients</p>
                        </Card>
                    </div>
                </section>

                {/* Core Values */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Heart className="text-purple-600" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-jalanea-900">What We Believe</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                title: "Everyone is Worthy",
                                desc: "Every person deserves love, compassion, support, and respect. No exceptions.",
                                icon: Heart
                            },
                            {
                                title: "Community Over Individuality",
                                desc: "Your success matters. AND it matters more when it lifts others.",
                                icon: Users
                            },
                            {
                                title: "Staying Is Strength",
                                desc: "Leaving isn't the only path to success. Building where you're from takes vision, courage, and grit.",
                                icon: MapPin
                            },
                            {
                                title: "Action Over Waiting",
                                desc: "We're not waiting for a billion-dollar government program. We're building what we need, now.",
                                icon: Sparkles
                            },
                        ].map((value, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-jalanea-200">
                                <div className="p-2 bg-jalanea-100 rounded-lg shrink-0">
                                    <value.icon size={20} className="text-jalanea-700" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-jalanea-900">{value.title}</h4>
                                    <p className="text-jalanea-600">{value.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* The Vision */}
                <section className="text-center bg-gradient-to-r from-jalanea-100 to-gold/10 -mx-4 md:-mx-8 px-4 md:px-8 py-16 rounded-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-jalanea-200 text-jalanea-700 text-sm font-bold mb-6">
                        <Globe size={16} />
                        The Vision
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-jalanea-900 mb-6">Beyond Orlando</h2>

                    <p className="text-lg text-jalanea-600 max-w-3xl mx-auto leading-relaxed mb-8">
                        We start here. Valencia College. Orange County. Orlando. But this isn't where we stop.
                        Our vision is that <span className="font-bold text-jalanea-900">every city</span> has its own version
                        of Jalanea Works. Every community keeps its talent. Every graduate sees "staying home" as
                        a power move, not a consolation prize.
                    </p>

                    <p className="text-xl font-bold text-jalanea-900">
                        Orlando becomes the blueprint. Other cities follow.
                    </p>
                </section>

                {/* Call to Action */}
                <section className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-jalanea-900 mb-4">
                        Ready to Light Your Block?
                    </h2>
                    <p className="text-lg text-jalanea-600 mb-8">
                        Join thousands of Valencia grads building careers and community right here in Orlando.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button variant="primary" size="lg" onClick={() => navigate('/jobs')} className="gap-2">
                            Find Your Career <ArrowRight size={18} />
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => navigate('/entrepreneur')} className="gap-2">
                            Start a Business <ExternalLink size={18} />
                        </Button>
                    </div>
                </section>

            </div>

            {/* Footer Note */}
            <div className="bg-jalanea-900 text-white py-12 px-4 md:px-8 text-center">
                <p className="text-jalanea-400 italic max-w-2xl mx-auto">
                    "Even if the world disagrees, I'm going to be the first person in line to allow something
                    to be created from a place of <span className="text-gold font-bold">radical empathy</span>."
                </p>
                <p className="text-sm text-jalanea-500 mt-4">– Alexus Jalanea Jenkins, Founder</p>
            </div>
        </div>
    );
};
