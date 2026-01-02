import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  GraduationCap, Briefcase, Award, PenTool, Edit3, MapPin,
  Save, X, Plus, Trash2, Loader2, User, Link, Camera, Crown, Sparkles, Zap,
  CreditCard, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { isOwnerEmail, formatCredits, getCreditUsagePercent } from '../services/creditsService';
import { setUserTier, getTierInfo, SettableTier } from '../utils/setUserTier';
import { redirectToBillingPortal, SUBSCRIPTION_TIERS, formatPrice } from '../services/stripeService';
import { DEGREE_TYPE_OPTIONS } from '../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../services/firebase';
import { haptics } from '../utils/haptics';

// Keep MOCK_PROFILE for backwards compatibility with other pages
export const MOCK_PROFILE: any = { // Typed as any temporarily to allow flexibility or import UserProfile and cast
  fullName: "Alex Doe",
  email: "alex.doe@valenciacollege.edu",
  location: "Orlando, FL",
  photoURL: "",

  education: [
    { degree: "B.A.S. Computing Technology", school: "Valencia College", year: "2024", gpa: "3.93" }
  ],
  experience: [
    { role: "Junior UI/UX Design Intern", company: "PETE Learning", duration: "Jun 2024 - Aug 2024", description: ["Enhanced platforms with fresh perspective."] }
  ],
  skills: {
    technical: ["Java", "SQL", "Docker", "HTML/CSS/JS"],
    design: ["Figma", "Adobe Creative Suite"],
    soft: ["Conflict Resolution", "Adaptability"]
  },
  certifications: [
    { name: "Graphics Interactive Design", issuer: "Valencia College" }
  ],

  // Nested to match UserProfile
  preferences: {
    targetRoles: [],
    workStyles: [],
    learningStyle: ['Video', 'Reading'],
    salary: 45000,
    transportMode: ['Car', 'Uber'],
  },
  logistics: {
    isParent: false,
    childCount: 0,
    employmentStatus: 'Part-time',
  },
  onboardingCompleted: true,
  updatedAt: new Date().toISOString()
};

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, userCredits, refreshCredits, saveUserProfile, profileLoading } = useAuth();
  const { isLight } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingTier, setIsSwitchingTier] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for editing
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);


  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(45000);
  const [salaryMax, setSalaryMax] = useState(65000);
  const [monthlyNet, setMonthlyNet] = useState(0);
  const [maxRent, setMaxRent] = useState(0);
  const [maxCarPayment, setMaxCarPayment] = useState(0);
  const [transportMode, setTransportMode] = useState('Car');
  const [learningStyle, setLearningStyle] = useState('Video');

  // Sync state with Firebase profile
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || userProfile.name || currentUser?.displayName || '');
      setLocation(userProfile.location || '');
      setLinkedinUrl(userProfile.linkedinUrl || '');
      setPortfolioUrl(userProfile.portfolioUrl || '');

      // Education: Check both 'credentials' (new onboarding) and 'education' (old format)
      const credentials = (userProfile as any).credentials || [];
      const legacyEducation = userProfile.education || [];
      // Convert credentials to education format if needed
      const normalizedCredentials = credentials.map((cred: any) => ({
        school: cred.school,
        program: cred.program,
        degreeType: cred.degreeType || 'Certificate',
        gradYear: cred.graduationYear || cred.gradYear,
        status: cred.status || 'Alumni',
      }));
      setEducation(normalizedCredentials.length > 0 ? normalizedCredentials : legacyEducation);

      setExperience(userProfile.experience || []);
      setTargetRoles(userProfile.preferences?.targetRoles || []);

      // Financials - check both flat fields (new) and nested (old)
      setSalaryMin((userProfile as any).salaryMin || userProfile.targetSalaryRange?.min || userProfile.preferences?.salary || 45000);
      setSalaryMax((userProfile as any).salaryMax || userProfile.targetSalaryRange?.max || (userProfile.preferences?.salary ? userProfile.preferences.salary + 10000 : 65000));
      setMonthlyNet(userProfile.monthlyBudgetEstimate?.monthlyNet || 0);
      setMaxRent(userProfile.monthlyBudgetEstimate?.maxRent || 0);
      setMaxCarPayment(userProfile.monthlyBudgetEstimate?.maxCarPayment || 0);

      // Transport - check both flat (new) and nested (old) formats
      const commuteMethod = (userProfile as any).commuteMethod;
      if (Array.isArray(commuteMethod) && commuteMethod.length > 0) {
        setTransportMode(commuteMethod.join(', '));
      } else {
        setTransportMode(userProfile.preferences?.transportMode || 'Not set');
      }
      setLearningStyle(userProfile.preferences?.learningStyle || 'Video');
    } else if (currentUser) {
      // Default from Firebase Auth
      setFullName(currentUser.displayName || '');
    }
  }, [userProfile, currentUser]);

  const handleSave = async () => {
    setIsSaving(true);
    haptics.medium();
    try {
      await saveUserProfile({
        fullName,
        location,
        linkedinUrl,
        portfolioUrl,
        education,
        experience,
        preferences: {
          targetRoles,
          salary: salaryMax,
          transportMode,
          learningStyle,
          workStyles: userProfile?.preferences?.workStyles || []
        },
        targetSalaryRange: {
          min: salaryMin,
          max: salaryMax
        },
        updatedAt: new Date().toISOString()
      });
      haptics.success();
      setIsEditing(false);
    } catch (error) {
      haptics.error();
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setLocation(userProfile.location || '');
      setLinkedinUrl(userProfile.linkedinUrl || '');
      setPortfolioUrl(userProfile.portfolioUrl || '');
      setEducation(userProfile.education || []);
      setExperience(userProfile.experience || []);
    }
    setIsEditing(false);
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, { degreeLevel: '', program: '', gradYear: '' }]);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience handlers
  const addExperience = () => {
    setExperience([...experience, { role: '', company: '', duration: '' }]);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Target roles handlers
  const addRole = (role: string) => {
    if (role && !targetRoles.includes(role)) {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const removeRole = (role: string) => {
    setTargetRoles(targetRoles.filter(r => r !== role));
  };

  // Admin: Tier switching handler (owner accounts only)
  const handleSetTier = async (tier: SettableTier) => {
    if (!currentUser) return;
    setIsSwitchingTier(true);
    try {
      const success = await setUserTier(currentUser.uid, tier);
      if (success && refreshCredits) {
        await refreshCredits();
      }
    } catch (err) {
      console.error('Failed to set tier:', err);
    } finally {
      setIsSwitchingTier(false);
    }
  };

  // Check if current user is an owner
  const isOwner = isOwnerEmail(currentUser?.email);

  // Profile picture upload handler
  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE_MB = 5;

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser) {
      alert('Please sign in to upload a profile picture.');
      return;
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert(`Invalid file type: ${file.type || 'unknown'}\n\nAccepted formats: JPG, PNG, GIF, WebP`);
      return;
    }

    // Validate file size (max 5MB)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File too large: ${fileSizeMB}MB\n\nMaximum size: ${MAX_FILE_SIZE_MB}MB\n\nPlease choose a smaller image.`);
      return;
    }

    setIsUploadingPic(true);
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}/${Date.now()}_${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save to user profile
      await saveUserProfile({
        photoURL: downloadURL,
        updatedAt: new Date().toISOString()
      });

      console.log('Profile picture uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Failed to upload image.\n\nError: ${errorMessage}\n\nPlease try again or choose a different file.`);
    } finally {
      setIsUploadingPic(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#020617]">
        <Loader2 className="animate-spin text-gold w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 relative ${isLight ? 'bg-slate-50' : 'bg-[#020617]'}`}>
      {/* Background */}
      <div className={`fixed inset-0 pointer-events-none ${isLight ? 'bg-gradient-to-br from-slate-100 via-slate-50 to-white' : 'bg-gradient-to-br from-slate-900 via-[#020617] to-slate-900'}`} />
      <div className={`fixed top-0 right-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isLight ? 'bg-gold/10' : 'bg-gold/5'}`} />
      <div className={`fixed bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isLight ? 'bg-purple-500/10' : 'bg-purple-500/5'}`} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <div>
          <h1 className={`text-3xl md:text-4xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>My Account</h1>
          <p className={`font-medium mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Manage your career data for better job matching</p>
        </div>
      </div>

      {/* Edit Controls */}
      <div className={`flex items-center justify-between sticky top-4 z-30 backdrop-blur-xl p-3 rounded-2xl border ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#020617]/90 border-white/10'}`}>
        <h2 className={`text-xl font-bold pl-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>Career Data</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={isSaving} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-50">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-gold hover:bg-gold-light text-black rounded-xl shadow-[0_0_20px_rgba(255,196,37,0.3)] transition-all disabled:opacity-50">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            isLight
              ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm'
              : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:text-white hover:border-white/20'
          }`}>
            <Edit3 size={16} /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card variant="solid-white" className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center overflow-hidden">
              {(userProfile?.photoURL || currentUser?.photoURL) ? (
                <img
                  src={userProfile?.photoURL || currentUser?.photoURL || ''}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-gold" />
              )}
            </div>
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePicUpload}
                  accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPic}
                  className="absolute -bottom-1 -right-1 p-2.5 bg-jalanea-900 text-white rounded-full hover:bg-gold transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg"
                  title="Upload photo (JPG, PNG, GIF, WebP - Max 5MB)"
                >
                  {isUploadingPic ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <Input
                  label="Location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  icon={<MapPin size={16} />}
                />
                <Input
                  label="LinkedIn URL"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  icon={<Link size={16} />}
                />
                <Input
                  label="Portfolio URL"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  icon={<Link size={16} />}
                />
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-jalanea-900">{fullName || 'No name set'}</h2>
                  <p className="text-jalanea-600">{currentUser?.email}</p>
                  <p className="text-xs text-jalanea-400 font-mono mt-1">
                    User ID: {currentUser?.uid?.slice(-12) || 'Not logged in'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {location && (
                    <span className="flex items-center gap-1 text-jalanea-500">
                      <MapPin size={14} /> {location}
                    </span>
                  )}
                  {linkedinUrl && (
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Link size={14} /> LinkedIn
                    </a>
                  )}
                  {portfolioUrl && (
                    <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold hover:underline">
                      <Link size={14} /> Portfolio
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Education Section */}
      <Card variant="solid-white" className="overflow-hidden">
        <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap size={16} /> Education
          </h3>
          {isEditing && (
            <Button size="sm" variant="ghost" onClick={addEducation} icon={<Plus size={14} />}>
              Add
            </Button>
          )}
        </div>
        <div className="p-6 space-y-4">
          {education.length === 0 ? (
            <p className="text-jalanea-400 text-sm italic">No education added yet.</p>
          ) : (
            education.map((edu, idx) => (
              <div key={idx} className={`relative ${isEditing ? 'p-4 border border-jalanea-200 rounded-xl bg-jalanea-50' : 'p-3 hover:bg-jalanea-50 rounded-lg'}`}>
                {isEditing && (
                  <button onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-jalanea-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-bold text-jalanea-500 mb-1">Degree Type</label>
                      <select
                        value={edu.degreeType || edu.degreeLevel || ''}
                        onChange={e => updateEducation(idx, 'degreeType', e.target.value)}
                        className="w-full border border-jalanea-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                      >
                        <option value="">Select degree type...</option>
                        {DEGREE_TYPE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Program/Major"
                      placeholder="e.g., Computer Science"
                      value={edu.program || ''}
                      onChange={e => updateEducation(idx, 'program', e.target.value)}
                    />
                    <Input
                      label="Graduation Year"
                      placeholder="e.g., 2024"
                      value={edu.gradYear || ''}
                      onChange={e => updateEducation(idx, 'gradYear', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-jalanea-900">
                      {edu.degreeType || edu.degreeLevel} {(edu.program || edu.degree) && `in ${edu.program || edu.degree}`}
                    </h4>
                    {(edu.gradYear || edu.year) && (
                      <p className="text-sm text-jalanea-500">Class of {edu.gradYear || edu.year} • {edu.school}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Skills Section - from onboarding */}
      {(() => {
        const skills = (userProfile as any)?.skills;
        const hasSkills = skills && (
          (skills.technical?.length > 0) ||
          (skills.soft?.length > 0) ||
          (skills.design?.length > 0)
        );
        return hasSkills ? (
          <Card variant="solid-white" className="overflow-hidden">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} /> Skills
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {skills.technical?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-2">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.technical.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills.soft?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-2">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.soft.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills.design?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-2">Design Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.design.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : null;
      })()}

      {/* Work Preferences Section - from onboarding */}
      {(() => {
        const profile = userProfile as any;
        const hasPrefs = profile?.availability || profile?.commuteWillingness || profile?.shiftPreference?.length > 0;
        return hasPrefs ? (
          <Card variant="solid-white" className="overflow-hidden">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={16} /> Work Preferences
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile?.availability && (
                  <div>
                    <p className="text-xs font-bold text-jalanea-400 uppercase mb-1">Availability</p>
                    <p className="text-sm font-medium text-jalanea-900 capitalize">
                      {profile.availability === 'open' ? 'Open to anything' :
                       profile.availability === 'weekdays' ? 'Weekdays preferred' :
                       profile.availability === 'weekends' ? 'Weekends preferred' :
                       profile.availability === 'flexible' ? 'Flexible hours' :
                       profile.availability === 'limited' ? 'Specific days only' :
                       profile.availability}
                    </p>
                  </div>
                )}
                {profile?.commuteWillingness && (
                  <div>
                    <p className="text-xs font-bold text-jalanea-400 uppercase mb-1">Commute Willingness</p>
                    <p className="text-sm font-medium text-jalanea-900 capitalize">
                      {profile.commuteWillingness === 'local' ? 'Local (< 30 min)' :
                       profile.commuteWillingness === 'standard' ? 'Standard (< 60 min)' :
                       profile.commuteWillingness === 'extended' ? 'Any Distance (60+ min)' :
                       profile.commuteWillingness}
                    </p>
                  </div>
                )}
                {profile?.shiftPreference?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-jalanea-400 uppercase mb-1">Shift Preference</p>
                    <p className="text-sm font-medium text-jalanea-900 capitalize">
                      {profile.shiftPreference.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              {profile?.selectedDays?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-jalanea-100">
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-2">Available Days</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.selectedDays.map((day: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gold/10 text-jalanea-800 rounded-full text-sm font-medium border border-gold/20 capitalize">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : null;
      })()}

      {/* Reality & Challenges Section - from Stage 5 onboarding */}
      {(() => {
        const profile = userProfile as any;
        const challenges = profile?.selectedPrompts || [];
        const realityContext = profile?.realityContext || profile?.realityChallenges || '';

        // Available challenge prompts for adding new ones
        const CHALLENGE_OPTIONS = [
          "I am a single parent",
          "No reliable car",
          "Health challenges",
          "English is my 2nd language",
          "Need immediate income",
          "Criminal record",
          "Limited work experience",
          "Caregiving responsibilities",
          "Housing instability",
          "Limited internet access"
        ];

        return (
          <Card variant="solid-white" className="overflow-hidden">
            <div className="border-b border-jalanea-100 p-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-lg">🌟</span> Your Reality & Challenges
                </h3>
                <p className="text-xs text-jalanea-400 mt-1">We use this to find accommodating employers</p>
              </div>
              {isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // Open modal or show options
                    const newChallenge = prompt('Add a challenge (or type your own):');
                    if (newChallenge && !challenges.includes(newChallenge)) {
                      const updated = [...challenges, newChallenge];
                      saveUserProfile({ selectedPrompts: updated });
                    }
                  }}
                  icon={<Plus size={14} />}
                >
                  Add
                </Button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {/* Current Challenges */}
              {challenges.length > 0 ? (
                <div>
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-3">Current Considerations</p>
                  <div className="flex flex-wrap gap-2">
                    {challenges.map((challenge: string, idx: number) => (
                      <span
                        key={idx}
                        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-full text-sm font-medium border border-amber-200"
                      >
                        {challenge}
                        {isEditing && (
                          <button
                            onClick={() => {
                              const updated = challenges.filter((_: string, i: number) => i !== idx);
                              saveUserProfile({ selectedPrompts: updated });
                            }}
                            className="text-amber-500 hover:text-red-500 transition-colors p-1 -mr-1 rounded-full hover:bg-red-50"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-jalanea-400 text-sm mb-2">No challenges added yet</p>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-gold hover:underline"
                    >
                      Click edit to add your circumstances
                    </button>
                  )}
                </div>
              )}

              {/* Quick Add Buttons when editing */}
              {isEditing && (
                <div className="pt-4 border-t border-jalanea-100">
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-3">Quick Add Common Challenges</p>
                  <div className="flex flex-wrap gap-2">
                    {CHALLENGE_OPTIONS.filter(opt => !challenges.includes(opt)).map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const updated = [...challenges, option];
                          saveUserProfile({ selectedPrompts: updated });
                        }}
                        className="px-3 py-1.5 bg-jalanea-50 text-jalanea-600 rounded-full text-sm font-medium border border-jalanea-200 hover:bg-gold/10 hover:border-gold/30 hover:text-jalanea-800 transition-all"
                      >
                        + {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reality Context - free text */}
              {realityContext && (
                <div className="pt-4 border-t border-jalanea-100">
                  <p className="text-xs font-bold text-jalanea-400 uppercase mb-2">Your Story</p>
                  <p className="text-sm text-jalanea-600 bg-jalanea-50 rounded-lg p-3 border border-jalanea-100 italic">
                    "{realityContext}"
                  </p>
                </div>
              )}

              {/* Help text */}
              <div className="pt-4 mt-4 border-t border-jalanea-100">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-blue-500">💡</span>
                  <p className="text-xs text-blue-700">
                    <strong>Why share this?</strong> We use your circumstances to find employers who offer accommodations,
                    flexible scheduling, second-chance hiring, and other supportive programs. This info is never shared with employers directly.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Experience Section */}
      <Card variant="solid-white" className="overflow-hidden">
        <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
            <Briefcase size={16} /> Experience
          </h3>
          {isEditing && (
            <Button size="sm" variant="ghost" onClick={addExperience} icon={<Plus size={14} />}>
              Add
            </Button>
          )}
        </div>
        <div className="p-6 space-y-4">
          {experience.length === 0 ? (
            <p className="text-jalanea-400 text-sm italic">No experience added yet. That's okay - we'll help you find your first role!</p>
          ) : (
            experience.map((exp, idx) => (
              <div key={idx} className={`relative ${isEditing ? 'p-4 border border-jalanea-200 rounded-xl bg-jalanea-50' : 'p-3 border-l-2 border-jalanea-200 pl-4'}`}>
                {isEditing && (
                  <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-jalanea-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                    <Input
                      placeholder="Role/Title"
                      value={exp.role || ''}
                      onChange={e => updateExperience(idx, 'role', e.target.value)}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company || ''}
                      onChange={e => updateExperience(idx, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Duration (e.g., Jun 2024 - Present)"
                      value={exp.duration || ''}
                      onChange={e => updateExperience(idx, 'duration', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-jalanea-900">{exp.role || 'Untitled Role'}</h4>
                    <p className="text-sm text-jalanea-600">{exp.company}</p>
                    <p className="text-xs text-jalanea-400">{exp.duration}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Target Roles & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="solid-white" className="p-6">
          <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <PenTool size={14} /> Target Roles
          </h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {targetRoles.length === 0 ? (
                <p className="text-jalanea-400 text-sm italic">No target roles set.</p>
              ) : (
                targetRoles.map(role => (
                  <span key={role} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold/10 text-jalanea-800 rounded-full text-sm font-medium border border-gold/20">
                    {role}
                    {isEditing && (
                      <button onClick={() => removeRole(role)} className="text-jalanea-400 hover:text-red-500 ml-1 p-1 -mr-1 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-full hover:bg-red-50">
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                  placeholder="Add target role..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      addRole((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Card>

        <Card variant="solid-white" className="p-6">
          <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Award size={14} /> Preferences & Budget
          </h3>
          <div className="space-y-4">
            {/* Salary Tier Badge */}
            {(userProfile as any)?.salaryTier && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-sm font-bold border border-gold/20 capitalize">
                  {(userProfile as any).salaryTier === 'entry' ? 'Entry Level' :
                   (userProfile as any).salaryTier === 'growing' ? 'Growing' :
                   (userProfile as any).salaryTier === 'comfortable' ? 'Comfortable' :
                   (userProfile as any).salaryTier === 'established' ? 'Established' :
                   (userProfile as any).salaryTier === 'thriving' ? 'Thriving' :
                   (userProfile as any).salaryTier === 'advanced' ? 'Advanced' :
                   (userProfile as any).salaryTier}
                </span>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-jalanea-400 block mb-2">Target Salary Range</label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={salaryMin}
                    onChange={e => setSalaryMin(parseInt(e.target.value) || 0)}
                    placeholder="Min"
                  />
                  <span className="text-jalanea-400">-</span>
                  <Input
                    type="number"
                    value={salaryMax}
                    onChange={e => setSalaryMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                  />
                </div>
              ) : (
                <p className="text-lg font-bold text-jalanea-900">
                  ${salaryMin.toLocaleString()} – ${salaryMax.toLocaleString()}/year
                </p>
              )}
            </div>

            {(monthlyNet > 0) && (
              <div className="pt-2 border-t border-jalanea-100">
                <label className="text-xs font-bold text-jalanea-400 block mb-2">Monthly Budget Reality</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-jalanea-500 block text-xs">Max Rent (3x Rule)</span>
                    <span className="font-bold text-jalanea-900">${maxRent}</span>
                  </div>
                  <div>
                    <span className="text-jalanea-500 block text-xs">Max Car Note (15%)</span>
                    <span className="font-bold text-jalanea-900">${maxCarPayment}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-jalanea-400 block mb-2">Transport Mode</label>
              <p className="text-sm text-jalanea-700">{transportMode}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Section */}
      <Card variant="solid-white" className="overflow-hidden">
        <div className="border-b border-jalanea-100 p-4 md:p-6 bg-gradient-to-r from-jalanea-900 to-jalanea-800 text-white">
          <h3 className="text-sm md:text-base font-bold flex items-center gap-2">
            <CreditCard size={18} />
            Account
          </h3>
        </div>
        <div className="p-4 md:p-6">
          {/* Friendly Trial/Upgrade Message */}
          {(!userCredits?.stripeCustomerId || userCredits?.subscriptionStatus === 'trialing') && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gold/10 to-amber-50 rounded-xl border border-gold/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold/20 rounded-full">
                  <Sparkles size={18} className="text-gold" />
                </div>
                <div className="flex-1">
                  {userCredits?.subscriptionStatus === 'trialing' && userCredits?.trialEndsAt ? (
                    <>
                      <p className="font-bold text-jalanea-900">
                        {(() => {
                          const daysLeft = Math.max(0, Math.ceil((new Date(userCredits.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                          return `You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to explore!`;
                        })()}
                      </p>
                      <p className="text-sm text-jalanea-600 mt-1">
                        For less than a McDonald's meal, unlock unlimited career tools. Just $8/month to invest in your future.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-jalanea-900">Ready to invest in your future?</p>
                      <p className="text-sm text-jalanea-600 mt-1">
                        Just $8/month – less than a single meal out. Start building the career you deserve.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Current Plan & Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Current Plan */}
            <div className="bg-jalanea-50 rounded-xl p-4 border border-jalanea-200">
              <p className="text-xs text-jalanea-500 uppercase font-bold mb-1">Current Plan</p>
              <p className="text-xl md:text-2xl font-bold text-jalanea-900 capitalize flex items-center gap-2">
                {userCredits?.tier === 'unlimited' && <Crown size={20} className="text-gold" />}
                {userCredits?.tier === 'pro' && <Sparkles size={20} className="text-purple-500" />}
                {userCredits?.tier === 'starter' && <Zap size={20} className="text-blue-500" />}
                {userCredits?.tier || 'Trial'}
              </p>
              <p className="text-sm text-jalanea-600 mt-1">
                {userCredits?.subscriptionStatus === 'active' ? 'Active subscription' :
                  userCredits?.subscriptionStatus === 'trialing' ? '7-day free trial' :
                    userCredits?.subscriptionStatus || 'Trial period'}
              </p>
            </div>

            {/* Credits Status */}
            <div className="bg-jalanea-50 rounded-xl p-4 border border-jalanea-200">
              <p className="text-xs text-jalanea-500 uppercase font-bold mb-1">Credits Remaining</p>
              <p className="text-xl md:text-2xl font-bold text-jalanea-900">
                {formatCredits(userCredits?.credits || 0)}
                <span className="text-sm font-normal text-jalanea-500 ml-1">
                  / {formatCredits(userCredits?.monthlyCreditsLimit || 50)}
                </span>
              </p>
              {/* Progress bar */}
              <div className="mt-2 h-2 bg-jalanea-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all"
                  style={{ width: `${100 - getCreditUsagePercent(userCredits || { tier: 'trialing', credits: 0, creditsUsedThisMonth: 0, monthlyCreditsLimit: 50, lastCreditReset: null, trialEndsAt: null, stripeCustomerId: null, subscriptionId: null, subscriptionStatus: null })}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Manage Billing - only if they have a Stripe customer ID */}
            {userCredits?.stripeCustomerId && (
              <Button
                variant="secondary"
                onClick={async () => {
                  setIsLoadingPortal(true);
                  try {
                    await redirectToBillingPortal(userCredits.stripeCustomerId!, currentUser?.uid, currentUser?.email || undefined);
                  } catch (err) {
                    console.error('Portal error:', err);
                    alert('Unable to access billing portal. Please try again.');
                  } finally {
                    setIsLoadingPortal(false);
                  }
                }}
                disabled={isLoadingPortal}
                icon={isLoadingPortal ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                className="flex-1"
              >
                {isLoadingPortal ? 'Loading...' : 'Manage Billing'}
              </Button>
            )}

            {/* Upgrade CTA */}
            {userCredits?.tier !== 'unlimited' && (
              <Button
                variant="primary"
                onClick={() => navigate('/pricing')}
                icon={<ArrowUpRight size={16} />}
                className="flex-1"
              >
                {userCredits?.subscriptionStatus === 'trialing' ? 'Upgrade Now' : 'Change Plan'}
              </Button>
            )}

            {/* View Pricing */}
            {!userCredits?.stripeCustomerId && userCredits?.tier !== 'unlimited' && (
              <Button
                variant="outline"
                onClick={() => navigate('/pricing')}
                icon={<ChevronRight size={16} />}
                className="flex-1"
              >
                View Plans
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Admin Controls - Owner Only */}
      {isOwner && (
        <Card variant="solid-white" className="border-2 border-gold/30 bg-gradient-to-br from-gold/5 to-amber-50">
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Crown size={18} className="text-gold" />
              <h3 className="text-xs md:text-sm font-bold text-jalanea-900 uppercase tracking-wide">Admin: Tier Management</h3>
            </div>

            {/* Current Status - Stacks on mobile */}
            <div className="bg-white rounded-xl p-3 md:p-4 border border-jalanea-200 mb-3 md:mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-center">
                <div className="flex sm:block justify-between items-center sm:items-start">
                  <p className="text-xs text-jalanea-500 uppercase font-bold">Current Tier</p>
                  <p className="text-base md:text-lg font-bold text-jalanea-900 capitalize">{userCredits?.tier || 'Unknown'}</p>
                </div>
                <div className="flex sm:block justify-between items-center sm:items-start">
                  <p className="text-xs text-jalanea-500 uppercase font-bold">Credits</p>
                  <p className="text-base md:text-lg font-bold text-jalanea-900">{formatCredits(userCredits?.credits || 0)}</p>
                </div>
                <div className="flex sm:block justify-between items-center sm:items-start">
                  <p className="text-xs text-jalanea-500 uppercase font-bold">Status</p>
                  <p className="text-base md:text-lg font-bold text-green-600 capitalize">{userCredits?.subscriptionStatus || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Tier Switching Buttons - 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {(['trialing', 'starter', 'pro', 'unlimited'] as SettableTier[]).map((tier) => {
                const info = getTierInfo(tier);
                const isActive = userCredits?.tier === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => handleSetTier(tier)}
                    disabled={isSwitchingTier || isActive}
                    className={`p-3 md:p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden active:scale-95
                      ${isActive
                        ? 'border-jalanea-900 bg-jalanea-900 text-white shadow-lg'
                        : `${info.color} border hover:shadow-md`
                      }
                      ${isSwitchingTier ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {isActive && <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2"><Sparkles size={12} className="text-gold md:w-[14px] md:h-[14px]" /></div>}
                    <p className="font-bold text-xs md:text-sm">{info.name}</p>
                    <p className="text-[10px] md:text-xs opacity-80 mt-0.5 md:mt-1">{info.credits} credits</p>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] md:text-xs text-slate-500 mt-3 md:mt-4 text-center">
              {isSwitchingTier ? 'Switching tier...' : 'Tap a tier to test. Changes take effect immediately.'}
            </p>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
};
