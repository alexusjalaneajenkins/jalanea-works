import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, HelpCircle, ChevronDown, ChevronUp, Coffee, Heart, Zap } from 'lucide-react';
import { Button } from '../components/Button';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does the 3-day free trial work?",
    answer: "When you sign up for any plan, you get full access for 3 days completely free. Your card won't be charged until day 4. If you cancel before then, you won't be charged anything."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel anytime from your dashboard or by clicking 'Manage Subscription'. You'll keep access until the end of your billing period."
  },
  {
    question: "How do I get a refund?",
    answer: "We offer a 7-day money-back guarantee. If you're not satisfied within 7 days of your first payment, email us at business@jalanea.works and we'll refund you in full, no questions asked."
  },
  {
    question: "What are credits and how do they work?",
    answer: "Credits are used for AI-powered features like resume tailoring, cover letters, and interview prep. Each action uses a certain number of credits. Your credits reset monthly with your subscription."
  },
  {
    question: "What happens when I run out of credits?",
    answer: "You'll get a notification when you're running low. You can upgrade your plan for more credits or wait until your next billing cycle when credits reset."
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes! If you're a Pell Grant recipient or can demonstrate financial need, email us at business@jalanea.works with proof and we'll set you up with a scholarship plan."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption for all data. Your resume and personal information are never sold or shared with third parties."
  },
  {
    question: "How is Jalanea Works different from other job platforms?",
    answer: "We're built by a Valencia College grad who understands what it's like to feel overlooked. Our AI is specifically trained to help community college students compete with university grads, and a portion of every subscription goes back to the community."
  }
];

export const Support: React.FC = () => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-jalanea-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-jalanea-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-jalanea-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tighter">
            Jalanea<span className="text-gold">Works</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold mb-6">
            <HelpCircle size={16} />
            Help & Support
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How Can We Help?
          </h1>
          <p className="text-xl text-jalanea-300 max-w-2xl mx-auto">
            Got questions? We've got answers. And if you don't see what you're looking for, reach out directly.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <a
            href="mailto:business@jalanea.works"
            className="flex items-start gap-4 p-6 bg-jalanea-900/50 rounded-xl border border-white/10 hover:border-gold/30 transition-colors group"
          >
            <div className="p-3 rounded-lg bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Email Us</h3>
              <p className="text-jalanea-400 text-sm mb-2">For general inquiries, partnerships, or support</p>
              <span className="text-gold font-medium">business@jalanea.works</span>
            </div>
          </a>

          <a
            href="https://www.instagram.com/JalaneaJ_/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-6 bg-jalanea-900/50 rounded-xl border border-white/10 hover:border-gold/30 transition-colors group"
          >
            <div className="p-3 rounded-lg bg-gold/10 text-gold group-hover:bg-gold/20 transition-colors">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">DM on Instagram</h3>
              <p className="text-jalanea-400 text-sm mb-2">Quick questions or just want to connect</p>
              <span className="text-gold font-medium">@JalaneaJ_</span>
            </div>
          </a>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-display font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-jalanea-900/50 rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium pr-4">{item.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp size={20} className="text-gold flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-jalanea-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6 text-jalanea-300 border-t border-white/5 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Refund Policy */}
        <div className="bg-gradient-to-b from-gold/10 to-gold/5 rounded-2xl p-8 border border-gold/20 mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-gold" size={24} />
            <h2 className="text-2xl font-display font-bold">7-Day Money-Back Guarantee</h2>
          </div>
          <p className="text-jalanea-200 mb-4">
            Not happy with Jalanea Works? No problem. If you're not satisfied within 7 days of your first payment, 
            email us at <a href="mailto:business@jalanea.works" className="text-gold hover:underline">business@jalanea.works</a> and 
            we'll refund you in full. No questions asked, no hard feelings.
          </p>
          <p className="text-jalanea-400 text-sm">
            We believe in our product, and we want you to feel confident trying it.
          </p>
        </div>

        {/* Support the Mission */}
        <div className="text-center">
          <p className="text-jalanea-400 mb-4">
            Want to support the mission without subscribing?
          </p>
          <a
            href="https://buymeacoffee.com/jalanea"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
          >
            <Coffee size={20} />
            Buy Me a Coffee
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-jalanea-500 border-t border-white/5">
        <p>© 2024 Jalanea Works | Part of the "Light the Block" Movement</p>
      </footer>
    </div>
  );
};

export default Support;
