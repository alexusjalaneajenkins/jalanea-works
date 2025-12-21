
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavRoute } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowLeft, ArrowRight, Star, Heart, GraduationCap, Briefcase, Zap, Quote, MapPin, Palette, Award, CheckCircle2, Instagram, Calendar } from 'lucide-react';

interface AboutProps {
    setRoute: (route: NavRoute) => void;
}

// --- Golden Particles Component ---
const GoldenParticles = () => {
    // Generate random particles
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
        size: 2 + Math.random() * 4,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bg-gold rounded-full opacity-0 animate-trickle"
                    style={{
                        left: `${p.left}%`,
                        top: '-20px',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        boxShadow: `0 0 ${p.size * 2}px #FFC425`,
                    }}
                />
            ))}
            <style>{`
        @keyframes trickle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(10px); opacity: 0; }
        }
        .animate-trickle {
          animation-name: trickle;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
        </div>
    );
};

export const About: React.FC<AboutProps> = ({ setRoute }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-jalanea-950 text-white selection:bg-gold selection:text-jalanea-950 font-sans relative overflow-x-hidden">

            {/* Background Ambience */}
            <div className="fixed inset-0 bg-gradient-to-b from-jalanea-950 via-jalanea-900 to-jalanea-950 z-[-1]"></div>
            <GoldenParticles />

            {/* Navigation */}
            <nav className="fixed w-full z-50 px-4 md:px-6 py-6 bg-gradient-to-b from-jalanea-950/90 to-transparent backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-jalanea-400 hover:text-white transition-colors"
                    >
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-gold group-hover:text-jalanea-950 transition-all">
                            <ArrowLeft size={16} />
                        </div>
                        Back to Mission
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-24 relative z-10">

                {/* --- HERO SECTION --- */}
                <header className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-20 md:mb-32">
                    <div className="flex-1 text-center md:text-left space-y-6 w-full">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-700">
                                <Star size={12} fill="currentColor" /> The Founder
                            </div>
                            <a
                                href="https://www.instagram.com/JalaneaJ_/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-jalanea-300 text-xs font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all animate-in fade-in slide-in-from-left-4 duration-700 delay-100"
                            >
                                <Instagram size={12} /> @JalaneaJ_
                            </a>
                        </div>

                        {/* Name as Main Title */}
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-white tracking-tight">
                            Alexus Jalanea Jenkins
                        </h1>

                        {/* Enhanced Name Meaning Display */}
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 relative">
                            {/* Decorative Line (Desktop) */}
                            <div className="absolute -left-6 top-2 bottom-2 w-1 bg-gradient-to-b from-gold via-white/20 to-transparent rounded-full hidden md:block"></div>

                            <div className="space-y-6 relative bg-white/5 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none border border-white/10 md:border-none">
                                {/* The Poetic Meaning */}
                                <p className="text-xl sm:text-2xl md:text-3xl font-serif italic text-jalanea-100 leading-relaxed">
                                    "Defender of <span className="text-transparent bg-clip-text bg-gold-flow bg-200% animate-text-flow font-bold relative inline-block">
                                        Shining Light
                                        {/* Subtle Underline SVG */}
                                        <svg className="absolute w-full h-2 bottom-0 left-0 text-gold/30 -translate-y-1 hidden md:block" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                                    </span>,
                                    <span className="block mt-2">Blessed By God"</span>
                                </p>

                                {/* The Structured Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/10 pt-6">
                                    <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
                                        <h4 className="text-[10px] font-bold text-jalanea-500 uppercase tracking-widest mb-1">Alexus</h4>
                                        <div className="h-px bg-white/10 flex-1 mx-4 md:hidden"></div>
                                        <p className="text-sm font-medium text-white">Defender</p>
                                    </div>
                                    <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
                                        <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">Jalanea</h4>
                                        <div className="h-px bg-gold/20 flex-1 mx-4 md:hidden"></div>
                                        <p className="text-sm font-medium text-gold">Shining Light</p>
                                    </div>
                                    <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
                                        <h4 className="text-[10px] font-bold text-jalanea-500 uppercase tracking-widest mb-1">Jenkins</h4>
                                        <div className="h-px bg-white/10 flex-1 mx-4 md:hidden"></div>
                                        <p className="text-sm font-medium text-white">Blessed By God</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-base md:text-lg text-jalanea-300 leading-relaxed font-light max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mt-6 mx-auto md:mx-0">
                            I am a <span className="text-white font-bold">Bridge Builder</span>, fighting for the students who feel invisible.
                        </p>
                    </div>

                    {/* Founder Image */}
                    <div className="relative w-64 h-64 md:w-96 md:h-96 shrink-0 animate-in fade-in zoom-in-95 duration-1000 mx-auto md:mx-0">
                        <div className="absolute inset-0 bg-gold rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                        <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://i.ibb.co/dsKSJ2LT/IMG-6397-modified.png"
                                alt="Alexus Jalanea Jenkins"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-jalanea-950/90 to-transparent p-6">
                                <p className="text-gold text-sm font-bold uppercase tracking-wider">Valencia College Grad '25</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- TIMELINE JOURNEY --- */}
                <div className="space-y-24 md:space-y-32">

                    {/* Chapter 1: The Struggle & The Spark */}
                    <section className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-jalanea-800 md:left-1/2 md:-translate-x-1/2"></div>

                        {/* 1. Early Life */}
                        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16 mb-16 md:mb-24 relative">
                            <div className="w-full md:w-1/2 md:text-right space-y-4 pr-0 md:pr-4 pl-12 md:pl-0">
                                <div className="inline-block p-3 bg-jalanea-900 rounded-2xl border border-white/10 shadow-xl mb-2">
                                    <GraduationCap className="text-jalanea-400" size={24} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">The Hard Way</h3>

                                <div className="w-full">
                                    <p className="text-jalanea-300 leading-relaxed text-base md:text-lg">
                                        School wasn't easy. Growing up, I had <span className="text-white font-bold">seizures</span>, a <span className="text-white font-bold">stutter</span> and a difficult time comprehending information, so I was placed in reading classes. Learning was a battle I faced every single day.
                                    </p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 inline-block text-left w-full shadow-lg">
                                    <p className="text-base text-jalanea-200 italic leading-relaxed">
                                        "To compenstate for my struggles, I studied <span className="text-gold font-bold">4 hours every day</span> after school just to get a C. By the 8th grade, I won <span className="text-white font-bold">'Smartest Kid in Class'</span> through sheer determination and willpower. I never wanted my struggles to limit or define me."
                                    </p>
                                </div>
                            </div>

                            <div className="absolute left-4 w-4 h-4 bg-gold rounded-full -translate-x-1.5 border-4 border-jalanea-950 md:left-1/2 md:-translate-x-2 mt-6 md:mt-6"></div>

                            <div className="w-full md:w-1/2 pl-12 md:pl-4 pt-2">
                                <div className="relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden group w-full max-w-sm mx-auto md:mx-0">
                                    <img
                                        src="https://i.ibb.co/14nzJRd/Alexus-Jenkins-5.jpg"
                                        alt="Alexus at Age 8"
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-jalanea-950/90 to-transparent p-6 pt-12">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Palette className="text-gold" size={16} />
                                            <h4 className="font-bold text-white text-lg">Age 8: The Discovery</h4>
                                        </div>
                                        <p className="text-xs text-jalanea-300 uppercase tracking-wide mb-2">2nd Place, Orlando Art Fair</p>
                                        <p className="text-sm text-jalanea-200 italic">"I painted Van Gogh with his ear bandaged.< br /> That's when I discovered I had a gift."</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. The Entrepreneurial Spirit */}
                        <div className="mb-16 md:mb-24 relative pl-4 md:pl-0">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-jalanea-800 md:left-1/2 md:-translate-x-1/2"></div>

                            <div className="text-center mb-12 relative z-10 bg-jalanea-950 inline-block px-4 left-1/2 -translate-x-1/2">
                                <div className="inline-block p-3 bg-jalanea-900 rounded-2xl border border-white/10 shadow-xl mb-2">
                                    <Zap className="text-gold" size={24} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">The Entrepreneurial Spirit</h3>
                            </div>

                            <div className="space-y-16">

                                {/* Unison */}
                                <div className="flex flex-col md:flex-row items-center gap-8 relative">
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-gold rounded-full -translate-x-1.5 md:-translate-x-2 border-4 border-jalanea-950 z-10 top-0 md:top-6"></div>

                                    <div className="w-full md:w-1/2 md:pr-12 pl-12 md:pl-0 text-left md:text-right">
                                        <h4 className="font-bold text-white text-lg uppercase tracking-wide mb-2">Ages 13-15: #Unison</h4>
                                        <p className="text-jalanea-300 leading-relaxed">
                                            At 13, I started my webcomic <span className="text-white font-bold">#Unison</span>, promoting emotional intelligence and creating a loyal online audience from it.
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/2 pl-12 md:pl-12">
                                        <div className="group relative overflow-hidden rounded-xl border border-white/10 shadow-lg max-w-sm">
                                            <img src="https://i.ibb.co/HTMZcTLr/Unison-Webcomic.png" alt="Unison Comic" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-white">#Unison Webcomic</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* The Hustle */}
                                <div className="flex flex-col md:flex-row-reverse items-center gap-8 relative">
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-purple-400 rounded-full -translate-x-1.5 md:-translate-x-2 border-4 border-jalanea-950 z-10 top-0 md:top-6"></div>

                                    <div className="w-full md:w-1/2 md:pl-12 pl-12 text-left">
                                        <h4 className="font-bold text-white text-lg uppercase tracking-wide mb-2">Ages 15-18: The Hustle</h4>
                                        <p className="text-jalanea-300 leading-relaxed mb-4">
                                            At 15, I worked as an Illustrator and Graphic Designer with <span className="text-white font-bold">West Orange High</span>'s students, teachers, and employees. Everybody knew about my artwork, they really enjoyed how bold and vibrant it was. Over 3 years, I accumulated <span className="text-white font-bold">250+ commissions</span>.
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 flex justify-start md:justify-end">
                                        <div className="group relative overflow-hidden rounded-xl border border-white/10 shadow-lg max-w-sm">
                                            <img src="https://i.ibb.co/C5kHvtf9/Portfolio-Artwork.png" alt="Portfolio Art" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Jason Swaby */}
                                <div className="flex flex-col md:flex-row items-center gap-8 relative">
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-blue-400 rounded-full -translate-x-1.5 md:-translate-x-2 border-4 border-jalanea-950 z-10 top-0 md:top-6"></div>

                                    <div className="w-full md:w-1/2 md:pr-12 pl-12 md:pl-0 text-left md:text-right">
                                        <h4 className="font-bold text-gold text-lg uppercase tracking-wide mb-1">Jason Swaby Collaboration</h4>
                                        <span className="text-xs font-bold text-jalanea-500 uppercase tracking-widest mb-3 block">After High School</span>
                                        <p className="text-jalanea-300 leading-relaxed">
                                            At 18, I was working as a cashier at <span className="text-white">Wendy's</span> when I came across Jason Swaby, a local Orlando artist. He checked out my illustrations on Instagram and decided to hire me as a <span className="text-white">Character Concept Artist</span> for a Children's TV Animated TV Show. As a webcomic book artist, I truly enjoyed seeing my concepts being brought to life.
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/2 pl-12 md:pl-12">
                                        <div className="group relative overflow-hidden rounded-xl border border-white/10 shadow-lg max-w-sm">
                                            <img src="https://i.ibb.co/d04W9mk7/Jason-Swaby-ConceptAt-Art.jpg" alt="Jason Swaby Concept Art" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Chef Potato */}
                                <div className="flex flex-col md:flex-row-reverse items-center gap-8 relative">
                                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-red-400 rounded-full -translate-x-1.5 md:-translate-x-2 border-4 border-jalanea-950 z-10 top-0 md:top-6"></div>

                                    <div className="w-full md:w-1/2 md:pl-12 pl-12 text-left">
                                        <h4 className="font-bold text-gold text-lg uppercase tracking-wide mb-1">Risen Rose Productions | Chef Potato</h4>
                                        <span className="text-xs font-bold text-jalanea-500 uppercase tracking-widest mb-3 block">The Breakthrough</span>
                                        <p className="text-jalanea-300 leading-relaxed mb-4">
                                            At 19, I entered a competition against <span className="text-white">200+ artists</span> and won first place to be hired as an Illustrator and created <span className="text-white">Chef Potato</span> for Risen Rose Productions. This artwork, which later transformed into adorable plushies available at <span className="text-white">Walmart</span>, showcases my creative fusion of design magic and playful storytelling.
                                        </p>
                                        <p className="text-jalanea-100 text-sm font-medium italic border-l-2 border-gold pl-4">
                                            "Presenting Chef Potato, the delightful plushie that started as artwork and now graces the shelves of Walmart."
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 flex justify-start md:justify-end">
                                        <div className="group relative overflow-hidden rounded-xl border border-white/10 shadow-lg max-w-sm">
                                            <img src="https://i.ibb.co/yB5rb5ns/Risen-Rose-Productions-Chef-Potato-Walmart.jpg" alt="Chef Potato in Walmart" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* 3. The Scholar */}
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-16 md:mb-24 relative">
                            <div className="w-full md:w-1/2 md:text-right space-y-6 pr-0 md:pr-4 pl-12 md:pl-0">
                                <div className="inline-block p-3 bg-jalanea-900 rounded-2xl border border-white/10 shadow-xl mb-2">
                                    <Award className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">The Strategic Scholar (2021)</h3>

                                <div className="space-y-4">
                                    <p className="text-jalanea-300 leading-relaxed text-base">
                                        In 2021, the <span className="text-white font-bold">Taco Bell Foundation</span> awarded me <br /> the Live Más Scholarship.
                                    </p>

                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left">
                                        <p className="text-sm text-jalanea-200 mb-2">
                                            I had offers from <span className="text-white font-bold">Rollins College</span> and <span className="text-white font-bold">MassArt</span>, but I chose <span className="text-gold font-bold">Valencia College</span> and I'm forever grateful for it.
                                        </p>
                                    </div>

                                    <p className="text-jalanea-300 leading-relaxed text-base">
                                        Around this time, I built a website for my art commissions. People didn't just like the art, they loved the site. They told me, <span className="text-white font-bold">"You should get into web design."</span> At Valencia, that suggestion turned into a discovery of <span className="text-white font-bold">UI/UX Design</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="absolute left-4 w-4 h-4 bg-purple-500 rounded-full -translate-x-1.5 border-4 border-jalanea-950 md:left-1/2 md:-translate-x-2"></div>

                            <div className="w-full md:w-1/2 pl-12 md:pl-4">
                                <img src="https://i.ibb.co/qMfNX7sK/Taco-Bell-Live-Mas.jpg" alt="Live Mas Winner" className="rounded-xl border border-white/10 shadow-2xl w-full max-w-md hover:scale-105 transition-transform duration-300" />
                            </div>
                        </div>

                    </section>

                    {/* Chapter 2: The Catalyst (UPDATED & EXPANDED) */}
                    <section className="max-w-6xl mx-auto mb-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                            {/* Left Content */}
                            <div className="space-y-8 pt-4">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
                                        <Heart size={14} fill="currentColor" /> The Catalyst
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
                                        January 13, 2025
                                    </h2>
                                </div>

                                <div className="space-y-6 text-lg text-jalanea-200 leading-relaxed font-light">
                                    <p>
                                        My father passed away on this day. He was not a hero. He had <span className="text-white font-bold">nine felonies</span>. He was a woman and child abuser.
                                    </p>
                                    <p>
                                        He died alone in a 2-star low-income apartment in Fresno County, where he had been stuck since 2014. His last words to me were a wish for my future to be terrible.
                                    </p>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl my-6">
                                        <p className="font-medium text-white italic">
                                            "When he died, despite all that, I still cared. I still had empathy."
                                        </p>
                                    </div>
                                    <p>
                                        I believe that people are not their mistakes. People are not their crimes. <span className="text-white font-bold">Every single person on this earth is worthy of love, compassion, support, and nurturing respect.</span>
                                    </p>
                                    <p>
                                        I know I might be in the minority for saying that, but I'm choosing to be who I am anyway because it's coming from a place of honesty and truth.
                                    </p>
                                </div>
                            </div>

                            {/* Right Content - Image */}
                            <div className="space-y-6">
                                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                    <img
                                        src="https://i.ibb.co/4Zf4bB1K/1-13-2025-Father-Passed-Away.png"
                                        alt="Father"
                                        className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-jalanea-950/80 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-xs text-jalanea-400 font-bold uppercase tracking-wider">A Complicated Legacy</p>
                                        <p className="text-white text-sm mt-1">Honoring the humanity, not the history.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* NEW FULL WIDTH SECTION: The Mission & The Launch */}
                    <section className="mt-24 max-w-5xl mx-auto">
                        <div className="bg-jalanea-900 border border-white/10 p-8 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                            <div className="relative z-10 flex flex-col items-center text-center space-y-10">

                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-xs font-bold uppercase tracking-widest">
                                    <Calendar size={14} /> The Vow
                                </div>

                                <h3 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">
                                    Launching January 13, 2026
                                </h3>
                                <p className="text-jalanea-400 text-sm font-bold uppercase tracking-widest -mt-6">One Year Later</p>

                                <div className="space-y-8 text-lg md:text-xl text-jalanea-200 leading-relaxed font-light max-w-3xl">
                                    <p>
                                        I created Jalanea Works because I believe that <span className="text-white font-medium border-b border-gold/30">everybody deserves a second chance</span>, including him.
                                    </p>
                                    <p>
                                        This website is a way to honor him. It is a way to honor those who believe they are not deserving. It is built to take people like my father from homelessness to an opportunity. To give them housing, a job, and a career where they can take care of themselves.
                                    </p>
                                    <p>
                                        Because these people are somebody's daughters, fathers, mothers, and nieces. We are all linked together somehow.
                                    </p>
                                </div>

                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

                                <div className="text-xl md:text-2xl font-serif italic text-gold max-w-2xl">
                                    "Even if the world disagrees, I'm going to be the first person in line to allow something to be created from a place of <span className="font-bold">radical empathy</span>."
                                </div>

                                <div className="pt-8">
                                    <Button size="lg" variant="primary" onClick={() => navigate('/')} className="shadow-2xl shadow-gold/20 animate-pulse">
                                        Join The Mission <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div >
    );
};
