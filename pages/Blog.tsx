import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavRoute } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
    ArrowLeft, ArrowRight, BookOpen, Calendar, Clock,
    Tag, User, Sparkles, TrendingUp, Rocket, MapPin
} from 'lucide-react';

interface BlogProps {
    setRoute: (route: NavRoute) => void;
}

// Blog article data - will be used for SEO
export interface BlogArticle {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    image?: string;
    featured?: boolean;
    tags: string[];
}

// Article data store
export const blogArticles: BlogArticle[] = [
    {
        slug: 'jobs-after-valencia-college-guide-2025',
        title: "Jobs After Valencia College: A Complete Guide for 2025",
        excerpt: "Graduating from Valencia? Here's everything you need to know about landing your first career job in Orlando, from resume tips to salary expectations.",
        category: "Career Guide",
        author: "Alexus Jenkins",
        date: "December 2024",
        readTime: "8 min read",
        featured: true,
        tags: ["Valencia College", "Entry-Level Jobs", "Orlando Careers"]
    },
    {
        slug: 'how-to-start-business-orlando',
        title: "How to Start a Business in Orlando (Step-by-Step Guide)",
        excerpt: "Everything Valencia grads need to know about launching an LLC in Florida, from $125 filing fees to free local resources that can help you succeed.",
        category: "Entrepreneurship",
        author: "Alexus Jenkins",
        date: "December 2024",
        readTime: "10 min read",
        featured: true,
        tags: ["Entrepreneurship", "Orlando", "LLC", "Startup"]
    },
    {
        slug: 'staying-hometown-power-move',
        title: "Why Staying in Your Hometown After College is a Power Move",
        excerpt: "Forget the 'you have to leave to succeed' myth. Here's why building in Orlando creates more lasting impact than chasing big city salaries.",
        category: "The Movement",
        author: "Alexus Jenkins",
        date: "December 2024",
        readTime: "6 min read",
        featured: true,
        tags: ["Community", "Brain Drain", "Orlando", "Jalanea Movement"]
    },
];

const categoryColors: Record<string, string> = {
    "Career Guide": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Entrepreneurship": "bg-gold/10 text-amber-700 border-gold/20",
    "The Movement": "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const categoryIcons: Record<string, React.ReactNode> = {
    "Career Guide": <TrendingUp size={14} />,
    "Entrepreneurship": <Rocket size={14} />,
    "The Movement": <Sparkles size={14} />,
};

export const Blog: React.FC<BlogProps> = ({ setRoute }) => {
    const navigate = useNavigate();

    const featuredArticles = blogArticles.filter(a => a.featured);

    return (
        <div className="min-h-screen bg-jalanea-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-jalanea-950 via-jalanea-900 to-jalanea-800 text-white overflow-hidden">
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
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-20 md:pt-12 md:pb-28 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold mb-6">
                        <BookOpen size={16} />
                        Jalanea Blog
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
                        Career Tips for<br />
                        <span className="text-gold">Valencia Grads</span>
                    </h1>

                    <p className="text-xl text-jalanea-300 max-w-2xl mx-auto">
                        Practical guides for finding jobs, starting businesses, and building
                        community in Orlando. Part of the Jalanea: Light the Block movement.
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
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-20">

                {/* Featured Articles */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-jalanea-900 mb-8 flex items-center gap-2">
                        <Sparkles className="text-gold" size={24} />
                        Featured Articles
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {featuredArticles.map((article) => (
                            <button
                                key={article.slug}
                                onClick={() => navigate(`/blog/${article.slug}`)}
                                className="text-left group"
                            >
                                <Card
                                    variant="solid-white"
                                    hoverEffect
                                    className="h-full flex flex-col"
                                >
                                    {/* Category Badge */}
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-4 w-fit ${categoryColors[article.category]}`}>
                                        {categoryIcons[article.category]}
                                        {article.category}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-jalanea-900 mb-2 group-hover:text-gold transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-sm text-jalanea-600 mb-4 flex-1 line-clamp-3">
                                        {article.excerpt}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-xs text-jalanea-500 pt-4 border-t border-jalanea-100">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {article.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {article.readTime}
                                        </span>
                                    </div>
                                </Card>
                            </button>
                        ))}
                    </div>
                </section>

                {/* All Articles */}
                <section>
                    <h2 className="text-2xl font-bold text-jalanea-900 mb-8">
                        All Articles
                    </h2>

                    <div className="space-y-4">
                        {blogArticles.map((article) => (
                            <button
                                key={article.slug}
                                onClick={() => navigate(`/blog/${article.slug}`)}
                                className="w-full text-left group"
                            >
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-jalanea-200 hover:border-gold hover:shadow-md transition-all">
                                    {/* Category Badge */}
                                    <div className={`shrink-0 p-2 rounded-lg ${categoryColors[article.category].replace('text-', 'bg-').split(' ')[0]}`}>
                                        {categoryIcons[article.category]}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-jalanea-900 group-hover:text-gold transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-jalanea-600 mt-1 line-clamp-1">
                                                    {article.excerpt}
                                                </p>
                                            </div>
                                            <ArrowRight size={18} className="text-jalanea-300 group-hover:text-gold shrink-0 mt-1 transition-colors" />
                                        </div>

                                        {/* Tags */}
                                        <div className="flex items-center gap-2 mt-3">
                                            {article.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="text-xs px-2 py-0.5 bg-jalanea-100 text-jalanea-600 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                            <span className="text-xs text-jalanea-400">
                                                • {article.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="mt-16 text-center bg-gradient-to-r from-jalanea-100 to-gold/10 -mx-4 md:-mx-8 px-4 md:px-8 py-12 rounded-3xl">
                    <h2 className="text-2xl font-bold text-jalanea-900 mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-jalanea-600 mb-6">
                        Join thousands of Valencia grads building careers in Orlando.
                    </p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/jobs')}>
                        Explore Careers <ArrowRight size={18} />
                    </Button>
                </section>
            </div>

            {/* Footer */}
            <div className="bg-jalanea-100 py-8 px-4 text-center">
                <p className="text-sm text-jalanea-500">
                    Part of <span className="font-bold text-jalanea-700">Jalanea: Light the Block</span>
                    <button onClick={() => navigate('/mission')} className="text-gold font-bold ml-1 hover:underline">
                        Learn more →
                    </button>
                </p>
            </div>
        </div>
    );
};
