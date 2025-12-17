
import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { NavRoute, UserProfile } from '../types';
import { ArrowRight, User, Wand2, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Search, Plus, Star, X, Linkedin, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
   setRoute: (route: NavRoute) => void;
}

const STEPS = {
   INTRO: 0,
   PROFILE_BASICS: 1,
   PROFILE_EDUCATION: 2,
   PROFILE_EXPERIENCE: 3,
   PROFILE_PREFS: 4
};

export const Onboarding: React.FC<OnboardingProps> = ({ setRoute }) => {
   const [currentStep, setCurrentStep] = useState(STEPS.INTRO);
   const [carouselIndex, setCarouselIndex] = useState(0);
   const { currentUser } = useAuth();
   const navigate = useNavigate();

   // --- FORM STATE ---
   const [basics, setBasics] = useState({
      name: currentUser?.displayName || '',
      location: '',
      linkedin: '',
      portfolio: ''
   });

   const [education, setEducation] = useState({
      school: 'Valencia College',
      degree: 'Associate of Science (A.S.)',
      gradYear: '2024',
      major: '',
      gpa: ''
   });

   const [experienceList, setExperienceList] = useState<any[]>([]);
   const [isAddingExperience, setIsAddingExperience] = useState(false);
   const [tempExp, setTempExp] = useState({ role: '', company: '', dates: '', description: '' });

   const [roleInput, setRoleInput] = useState('');
   const [roleTags, setRoleTags] = useState<string[]>(['Entry Level Designer']);
   const [salary, setSalary] = useState(50);

   const nextStep = () => setCurrentStep(prev => prev + 1);
   const prevStep = () => setCurrentStep(prev => prev - 1);

   // --- HANDLERS ---
   const handleBasicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setBasics({ ...basics, [e.target.name]: e.target.value });
   };

   const handleEducationChange = (field: string, value: string) => {
      setEducation({ ...education, [field]: value });
   };

   const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && roleInput.trim()) {
         setRoleTags([...roleTags, roleInput.trim()]);
         setRoleInput('');
      }
   };

   const removeTag = (tag: string) => {
      setRoleTags(roleTags.filter(t => t !== tag));
   };

   const addExperience = () => {
      if (tempExp.role && tempExp.company) {
         setExperienceList([...experienceList, { ...tempExp, description: tempExp.description.split('\n') }]);
         setTempExp({ role: '', company: '', dates: '', description: '' });
         setIsAddingExperience(false);
      }
   };

   const completeProfile = async () => {
      if (!currentUser) return;

      const profile: UserProfile = {
         name: basics.name,
         email: currentUser.email || '',
         photoURL: currentUser.photoURL || '',
         location: basics.location,
         education: [{
            school: education.school,
            degree: education.degree,
            year: education.gradYear,
            details: education.major,
            gpa: education.gpa
         }],
         experience: experienceList,
         skills: {
            technical: roleTags, // simplified mapping for now
            design: [],
            soft: []
         },
         certifications: [],
         learningStyle: ['Video'], // Default
         transportMode: ['Car'], // Default
         isParent: false,
         employmentStatus: 'Unemployed'
      };

      try {
         await setDoc(doc(db, "users", currentUser.uid), profile);
         navigate('/dashboard');
      } catch (e) {
         console.error("Error saving profile", e);
      }
   };

   const renderProgressBar = () => {
      if (currentStep < STEPS.PROFILE_BASICS) return null;
      const progress = ((currentStep - 1) / 4) * 100;

      return (
         <div className="w-full h-1.5 bg-jalanea-100 rounded-full mb-8 overflow-hidden">
            <div
               className="h-full bg-gold transition-all duration-500 ease-out"
               style={{ width: `${progress}%` }}
            ></div>
         </div>
      );
   };

   // --- STEP RENDERERS ---
   const renderIntro = () => {
      const slides = [
         { icon: <User size={48} />, title: "Build Your Profile", desc: "Tell us your degree and skills once. We remember forever." },
         { icon: <Wand2 size={48} />, title: "AI Matching", desc: "We scan thousands of jobs to find the ones that want your specific degree." },
         { icon: <Sparkles size={48} />, title: "One-Click Tailoring", desc: "Generate custom resumes for every application in seconds." }
      ];

      return (
         <div className="animate-in fade-in zoom-in-95 duration-500 w-full max-w-lg">
            <Card variant="solid-white" className="p-10 shadow-2xl text-center min-h-[400px] flex flex-col justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-jalanea-900 via-gold to-jalanea-900"></div>

               <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-jalanea-50 flex items-center justify-center text-gold shadow-inner mb-4">
                     {slides[carouselIndex].icon}
                  </div>
                  <div>
                     <h3 className="text-2xl font-display font-bold text-jalanea-900 mb-3">{slides[carouselIndex].title}</h3>
                     <p className="text-jalanea-600 font-medium text-lg leading-relaxed">{slides[carouselIndex].desc}</p>
                  </div>
               </div>

               <div className="flex flex-col gap-8 mt-8">
                  <div className="flex justify-center gap-2">
                     {slides.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-8 bg-jalanea-900' : 'w-2 bg-jalanea-200'}`}></div>
                     ))}
                  </div>

                  <div className="flex justify-between items-center">
                     <button onClick={() => setCurrentStep(STEPS.PROFILE_BASICS)} className="text-sm font-bold text-jalanea-400 hover:text-jalanea-900">Skip</button>
                     <Button
                        onClick={() => {
                           if (carouselIndex < 2) setCarouselIndex(p => p + 1);
                           else setCurrentStep(STEPS.PROFILE_BASICS);
                        }}
                        variant="primary"
                        icon={<ArrowRight size={16} />}
                     >
                        {carouselIndex === 2 ? "Let's Go" : "Next"}
                     </Button>
                  </div>
               </div>
            </Card>
         </div>
      );
   };

   const renderBasics = () => (
      <div className="animate-in slide-in-from-right-8 fade-in duration-300">
         <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-jalanea-900">Let's get to know you.</h2>
            <p className="text-jalanea-600">Start building your digital presence.</p>
         </div>

         <div className="space-y-6">
            <Button fullWidth variant="outline" icon={<Linkedin size={18} className="text-[#0077b5]" />} className="border-dashed border-2 bg-blue-50/50 text-jalanea-700 hover:bg-blue-50 hover:border-blue-200">
               Import from LinkedIn
            </Button>

            <div className="flex items-center gap-4">
               <div className="w-20 h-20 rounded-full bg-jalanea-100 flex items-center justify-center border-2 border-dashed border-jalanea-300 text-jalanea-400 cursor-pointer hover:border-gold hover:text-gold transition-colors">
                  <Plus size={24} />
               </div>
               <div className="flex-1 space-y-3">
                  <Input placeholder="Full Name" name="name" value={basics.name} onChange={handleBasicsChange} />
                  <Input placeholder="Location (e.g. Orlando, FL)" name="location" value={basics.location} onChange={handleBasicsChange} icon={<MapPin size={16} />} />
               </div>
            </div>

            <div className="space-y-3">
               <Input placeholder="LinkedIn URL" name="linkedin" value={basics.linkedin} onChange={handleBasicsChange} icon={<Linkedin size={16} />} />
               <Input placeholder="Portfolio / GitHub URL (Optional)" name="portfolio" value={basics.portfolio} onChange={handleBasicsChange} icon={<Globe size={16} />} />
            </div>
         </div>
      </div>
   );

   const renderEducation = () => (
      <div className="animate-in slide-in-from-right-8 fade-in duration-300">
         <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-jalanea-900">Show off your hard work.</h2>
            <p className="text-jalanea-600">This helps us find alumni-friendly employers.</p>
         </div>

         <Card variant="solid-white" className="p-6 border-jalanea-200 space-y-4">
            <Input label="Institution" value={education.school} onChange={(e) => handleEducationChange('school', e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-jalanea-900">Degree Level</label>
                  <select
                     className="w-full rounded-xl border-jalanea-200 py-3 px-4 text-jalanea-900 font-medium focus:ring-1 focus:ring-jalanea-900"
                     value={education.degree}
                     onChange={(e) => handleEducationChange('degree', e.target.value)}
                  >
                     <option>Associate of Science (A.S.)</option>
                     <option>Bachelor of Science (B.S.)</option>
                     <option>Certificate</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-jalanea-900">Graduation Year</label>
                  <select
                     className="w-full rounded-xl border-jalanea-200 py-3 px-4 text-jalanea-900 font-medium focus:ring-1 focus:ring-jalanea-900"
                     value={education.gradYear}
                     onChange={(e) => handleEducationChange('gradYear', e.target.value)}
                  >
                     <option>2024</option>
                     <option>2023</option>
                     <option>2022</option>
                  </select>
               </div>
            </div>

            <Input label="Major / Program" placeholder="Search programs..." value={education.major} onChange={(e) => handleEducationChange('major', e.target.value)} icon={<Search size={16} />} />
            <Input label="GPA (Optional)" placeholder="e.g. 3.8" value={education.gpa} onChange={(e) => handleEducationChange('gpa', e.target.value)} />
         </Card>

         <button className="flex items-center gap-2 text-sm font-bold text-gold hover:text-gold-dark mt-4 transition-colors">
            <Plus size={16} /> Add Another Degree
         </button>
      </div>
   );

   const renderExperience = () => (
      <div className="animate-in slide-in-from-right-8 fade-in duration-300 relative">
         <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-jalanea-900">Experience & Projects.</h2>
            <p className="text-jalanea-600">Include internships, part-time work, or major class projects.</p>
         </div>

         {experienceList.length === 0 && !isAddingExperience ? (
            <div
               onClick={() => setIsAddingExperience(true)}
               className="border-2 border-dashed border-jalanea-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all group"
            >
               <div className="w-12 h-12 rounded-full bg-jalanea-100 group-hover:bg-gold group-hover:text-jalanea-950 flex items-center justify-center text-jalanea-400 mb-3 transition-colors">
                  <Plus size={24} />
               </div>
               <p className="font-bold text-jalanea-600">Add First Position</p>
            </div>
         ) : (
            <div className="space-y-4">
               {experienceList.map((exp, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-jalanea-200 shadow-sm flex justify-between items-center">
                     <div>
                        <h4 className="font-bold text-jalanea-900">{exp.role}</h4>
                        <p className="text-sm text-jalanea-500">{exp.company}</p>
                     </div>
                     <Button variant="ghost" size="sm" className="text-jalanea-400"><Star size={16} /></Button>
                  </div>
               ))}
               {!isAddingExperience && (
                  <Button variant="outline" fullWidth onClick={() => setIsAddingExperience(true)} icon={<Plus size={16} />}>
                     Add Another
                  </Button>
               )}
            </div>
         )}

         {isAddingExperience && (
            <div className="mt-4 bg-white p-6 rounded-2xl shadow-lg border border-jalanea-100 animate-in zoom-in-95 duration-200">
               <div className="space-y-4">
                  <Input placeholder="Role Title" value={tempExp.role} onChange={(e) => setTempExp({ ...tempExp, role: e.target.value })} />
                  <Input placeholder="Company / Organization" value={tempExp.company} onChange={(e) => setTempExp({ ...tempExp, company: e.target.value })} />
                  <Input placeholder="Dates (e.g. Summer 2024)" value={tempExp.dates} onChange={(e) => setTempExp({ ...tempExp, dates: e.target.value })} />
                  <textarea
                     className="w-full rounded-xl border-jalanea-200 py-3 px-4 text-jalanea-900 text-sm focus:ring-1 focus:ring-jalanea-900 min-h-[100px]"
                     placeholder="Describe what you did... (Bullet points recommended)"
                     value={tempExp.description}
                     onChange={(e) => setTempExp({ ...tempExp, description: e.target.value })}
                  ></textarea>
                  <div className="flex gap-3 pt-2">
                     <Button fullWidth variant="secondary" onClick={() => setIsAddingExperience(false)}>Cancel</Button>
                     <Button fullWidth variant="primary" onClick={addExperience}>Save Position</Button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );

   const renderPrefs = () => (
      <div className="animate-in slide-in-from-right-8 fade-in duration-300">
         <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-jalanea-900">What are you looking for?</h2>
            <p className="text-jalanea-600">Help our AI find the perfect match.</p>
         </div>

         <div className="space-y-8">
            <div>
               <label className="text-sm font-bold text-jalanea-900 mb-2 block">Target Job Titles</label>
               <div className="bg-white p-3 border border-jalanea-200 rounded-xl flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-jalanea-900 transition-all">
                  {roleTags.map(tag => (
                     <span key={tag} className="bg-jalanea-100 text-jalanea-800 text-xs font-bold px-2 py-1.5 rounded flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                     </span>
                  ))}
                  <input
                     className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
                     placeholder="Type & Enter..."
                     value={roleInput}
                     onChange={(e) => setRoleInput(e.target.value)}
                     onKeyDown={handleAddTag}
                  />
               </div>
               <p className="text-xs text-jalanea-400 mt-2 ml-1">AI Suggestion: Based on "{education.degree}"</p>
            </div>

            <div>
               <label className="text-sm font-bold text-jalanea-900 mb-3 block">Work Style</label>
               <div className="flex gap-3">
                  {['Remote', 'Hybrid', 'On-site'].map(style => (
                     <button key={style} className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all
                        ${style === 'Hybrid' ? 'bg-jalanea-900 text-white border-jalanea-900' : 'bg-white text-jalanea-600 border-jalanea-200 hover:border-gold'}
                    `}>
                        {style}
                     </button>
                  ))}
               </div>
            </div>

            <div>
               <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-jalanea-900">Salary Expectation</label>
                  <span className="text-sm font-bold text-gold">${salary}k+</span>
               </div>
               <input
                  type="range"
                  min="30" max="150" step="5"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full accent-gold h-2 bg-jalanea-200 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex items-center gap-2 mt-3">
                  <input type="checkbox" className="rounded text-gold focus:ring-gold" id="flex" />
                  <label htmlFor="flex" className="text-sm font-medium text-jalanea-600 cursor-pointer">I'm flexible for the right opportunity</label>
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="min-h-screen bg-jalanea-50 bg-subtle-mesh flex flex-col relative overflow-hidden">

         <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-jalanea-900">
               <div className="w-8 h-8 rounded-lg bg-jalanea-900 flex items-center justify-center text-gold shadow-sm">
                  <data>Zap</data>
               </div>
               <span className="hidden sm:inline">Jalanea<span className="text-gold">Works</span></span>
            </div>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">

            {currentStep === STEPS.INTRO && renderIntro()}

            {currentStep >= STEPS.PROFILE_BASICS && (
               <div className="w-full max-w-2xl flex flex-col h-[calc(100vh-140px)] md:h-auto">

                  <Card variant="glass-light" className="flex-1 p-6 md:p-10 shadow-xl border-white/60 relative flex flex-col">
                     {renderProgressBar()}

                     <div className="flex-1 overflow-y-auto custom-scrollbar md:pr-2">
                        {currentStep === STEPS.PROFILE_BASICS && renderBasics()}
                        {currentStep === STEPS.PROFILE_EDUCATION && renderEducation()}
                        {currentStep === STEPS.PROFILE_EXPERIENCE && renderExperience()}
                        {currentStep === STEPS.PROFILE_PREFS && renderPrefs()}
                     </div>

                     <div className="pt-8 mt-4 border-t border-jalanea-100 flex justify-between items-center shrink-0">
                        <Button
                           variant="ghost"
                           onClick={prevStep}
                           icon={<ChevronLeft size={18} />}
                           className="text-jalanea-500 hover:text-jalanea-900 px-0 md:px-6"
                        >
                           Back
                        </Button>

                        {currentStep === STEPS.PROFILE_PREFS ? (
                           <Button
                              variant="primary"
                              onClick={completeProfile}
                              className="shadow-xl shadow-gold/20 animate-pulse"
                              icon={<CheckCircle2 size={18} />}
                           >
                              Complete Profile
                           </Button>
                        ) : (
                           <Button
                              variant="primary"
                              onClick={nextStep}
                              icon={<ChevronRight size={18} />}
                           >
                              Next Step
                           </Button>
                        )}
                     </div>
                  </Card>
               </div>
            )}
         </div>

         {currentStep > STEPS.INTRO && (
            <>
               <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-jalanea-900/5 rounded-full blur-[120px] pointer-events-none"></div>
            </>
         )}
      </div>
   );
};
