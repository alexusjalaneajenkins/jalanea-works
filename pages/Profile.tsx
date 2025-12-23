
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getSeedData } from '../utils/seedProfileData';
import {
  GraduationCap, Briefcase, Award, PenTool, Edit3, MapPin,
  Save, X, Plus, Trash2, Loader2, User, Link, Camera, Sparkles
} from 'lucide-react';

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

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, saveUserProfile, profileLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Handler to populate profile with seed data
  const handleSeedProfile = async () => {
    if (!window.confirm('This will replace your current profile with complete career data. Continue?')) return;
    setIsSeeding(true);
    try {
      const data = getSeedData();
      await saveUserProfile(data);
      // Refresh local state
      setFullName(data.fullName);
      setLocation(data.location);
      setEducation(data.education);
      setExperience(data.experience);
      setTargetRoles(data.preferences.targetRoles);
      setSalary(data.preferences.salary);
      alert('✅ Profile populated successfully! You can now generate resumes.');
    } catch (error) {
      console.error('Failed to seed profile:', error);
      alert('Failed to populate profile.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Local state for editing
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [salary, setSalary] = useState(45000);
  const [transportMode, setTransportMode] = useState('Car');
  const [learningStyle, setLearningStyle] = useState('Video');

  // Sync state with Firebase profile
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || currentUser?.displayName || '');
      setLocation(userProfile.location || '');
      setLinkedinUrl(userProfile.linkedinUrl || '');
      setPortfolioUrl(userProfile.portfolioUrl || '');
      setEducation(userProfile.education || []);
      setExperience(userProfile.experience || []);
      setTargetRoles(userProfile.preferences?.targetRoles || []);
      setSalary(userProfile.preferences?.salary || 45000);
      setTransportMode(userProfile.preferences?.transportMode || 'Car');
      setLearningStyle(userProfile.preferences?.learningStyle || 'Video');
    } else if (currentUser) {
      // Default from Firebase Auth
      setFullName(currentUser.displayName || '');
    }
  }, [userProfile, currentUser]);

  const handleSave = async () => {
    setIsSaving(true);
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
          salary,
          transportMode,
          learningStyle,
          workStyles: userProfile?.preferences?.workStyles || []
        },
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
    } catch (error) {
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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-gold w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-jalanea-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-jalanea-900">My Profile</h1>
          <p className="text-jalanea-600 font-medium mt-1">Manage your career data for better job matching</p>
        </div>
      </div>

      {/* Edit Controls */}
      <div className="flex items-center justify-between sticky top-4 z-30 bg-jalanea-50/90 backdrop-blur-sm p-2 rounded-xl border border-jalanea-200 shadow-sm">
        <h2 className="text-xl font-bold text-jalanea-900 pl-2">Career Data</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel} icon={<X size={16} />} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleSave} icon={isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSeedProfile}
              icon={isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              disabled={isSeeding}
              className="text-gold border-gold/30 hover:bg-gold/10"
            >
              {isSeeding ? 'Loading...' : 'Populate Career Data'}
            </Button>
            <Button size="sm" onClick={() => setIsEditing(true)} icon={<Edit3 size={16} />}>
              Edit Profile
            </Button>
          </div>
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
              <button className="absolute bottom-0 right-0 p-1.5 bg-jalanea-900 text-white rounded-full">
                <Camera size={14} />
              </button>
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
                    <Input
                      placeholder="Degree Level (e.g., A.S., B.A.S.)"
                      value={edu.degreeLevel || ''}
                      onChange={e => updateEducation(idx, 'degreeLevel', e.target.value)}
                    />
                    <Input
                      placeholder="Program/Major"
                      value={edu.program || ''}
                      onChange={e => updateEducation(idx, 'program', e.target.value)}
                    />
                    <Input
                      placeholder="Graduation Year"
                      value={edu.gradYear || ''}
                      onChange={e => updateEducation(idx, 'gradYear', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-jalanea-900">
                      {edu.degreeLevel} {edu.program && `in ${edu.program}`}
                    </h4>
                    {edu.gradYear && (
                      <p className="text-sm text-jalanea-500">Class of {edu.gradYear}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

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
                  <span key={role} className="inline-flex items-center gap-1 px-3 py-1 bg-gold/10 text-jalanea-800 rounded-full text-sm font-medium border border-gold/20">
                    {role}
                    {isEditing && (
                      <button onClick={() => removeRole(role)} className="text-jalanea-400 hover:text-red-500">
                        <X size={12} />
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
            <Award size={14} /> Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-jalanea-400 block mb-2">Minimum Salary Target</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={salary}
                  onChange={e => setSalary(parseInt(e.target.value) || 0)}
                />
              ) : (
                <p className="text-lg font-bold text-jalanea-900">${salary.toLocaleString()}/year</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-jalanea-400 block mb-2">Transport Mode</label>
              <p className="text-sm text-jalanea-700">{transportMode}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-jalanea-400 block mb-2">Learning Style</label>
              <p className="text-sm text-jalanea-700">{learningStyle}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
