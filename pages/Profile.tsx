
import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UserProfile, Education, Experience, Certification, LearningStyle, TransportMode } from '../types';
import { GraduationCap, Briefcase, Award, PenTool, Edit3, Heart, Video, MapPin, Car, Bus, Bike, Footprints, Zap, Save, X, Plus, Trash2, Check, BookOpen } from 'lucide-react';

// Mock Profile Data matching the screenshot
export const MOCK_PROFILE: UserProfile = {
  name: "Alex Doe",
  email: "alex.doe@valenciacollege.edu",
  location: "Orlando, FL",
  learningStyle: ['Video', 'Reading'],
  transportMode: ['Car', 'Uber'],
  isParent: false,
  employmentStatus: 'Part-time',
  education: [
    {
      degree: "Bachelor of Applied Science: Computing Technology & Software Development",
      school: "Valencia College",
      gpa: "3.93",
      year: "2024"
    },
    {
      degree: "Associate of Science: Graphic and Interactive Design",
      school: "Valencia College",
      gpa: "3.89",
      year: "2022"
    },
    {
      degree: "Associate of Arts: General Studies",
      school: "Valencia College",
      gpa: "3.88",
      year: "2020"
    }
  ],
  experience: [
    {
      role: "Junior UI/UX Design Intern",
      company: "PETE Learning",
      duration: "Jun 2024 - Aug 2024",
      description: [
        "Served as Junior UI/UX Designer to enhance PETE Learning's platforms with a fresh perspective.",
        "Identified navigation challenges and proposed a new tooltip system to reduce user confusion."
      ]
    },
    {
      role: "Kid Coordinator (Imagination Station)",
      company: "Mosaic Church",
      duration: "Jun 2024 - Aug 2024",
      description: [
        "Coordinated 9 rotating activity stations for over 120 children.",
        "Developed hands-on learning activities."
      ]
    }
  ],
  skills: {
    technical: ["Java", "SQL", "Docker", "HTML/CSS/JS", "SDLC", "Database Management", "VS Code", "GitHub"],
    design: ["Figma", "Adobe Creative Suite (Ps, Ai, Id, Ae)", "User Journey Mapping", "Wireframing"],
    soft: ["Conflict Resolution", "Adaptability", "Empathy", "Team Leadership", "High-Volume Cash Handling"]
  },
  certifications: [
    { name: "Graphics Interactive Design Production", issuer: "Valencia College" },
    { name: "Interactive Design Support", issuer: "Valencia College" },
    { name: "Microsoft Office Specialist", issuer: "Microsoft" }
  ]
};

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [newSkill, setNewSkill] = useState("");

  const handleSave = () => setIsEditing(false);
  const handleCancel = () => {
    setProfile(MOCK_PROFILE);
    setIsEditing(false);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...profile.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setProfile({ ...profile, education: newEdu });
  };

  const addEducation = () => {
    setProfile({
        ...profile,
        education: [...profile.education, { degree: "", school: "", year: "", gpa: "" }]
    });
  };

  const removeEducation = (index: number) => {
    const newEdu = [...profile.education];
    newEdu.splice(index, 1);
    setProfile({ ...profile, education: newEdu });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...profile.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setProfile({ ...profile, experience: newExp });
  };

  const addExperience = () => {
      setProfile({
          ...profile,
          experience: [...profile.experience, { role: "", company: "", duration: "", description: [""] }]
      });
  };

  const removeExperience = (index: number) => {
      const newExp = [...profile.experience];
      newExp.splice(index, 1);
      setProfile({ ...profile, experience: newExp });
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
      const newCerts = [...profile.certifications];
      newCerts[index] = { ...newCerts[index], [field]: value };
      setProfile({ ...profile, certifications: newCerts });
  };

  const addCertification = () => {
      setProfile({
          ...profile,
          certifications: [...profile.certifications, { name: "", issuer: "" }]
      });
  };

  const removeCertification = (index: number) => {
      const newCerts = [...profile.certifications];
      newCerts.splice(index, 1);
      setProfile({ ...profile, certifications: newCerts });
  };

  const removeSkill = (category: keyof typeof profile.skills, skillToRemove: string) => {
      setProfile({
          ...profile,
          skills: {
              ...profile.skills,
              [category]: profile.skills[category].filter(s => s !== skillToRemove)
          }
      });
  };

  const addSkill = (category: keyof typeof profile.skills) => {
      if (!newSkill.trim()) return;
      if (!profile.skills[category].includes(newSkill.trim())) {
          setProfile({
              ...profile,
              skills: {
                  ...profile.skills,
                  [category]: [...profile.skills[category], newSkill.trim()]
              }
          });
      }
      setNewSkill("");
  };

  const toggleLearningStyle = (style: LearningStyle) => {
      const current = profile.learningStyle;
      if (current.includes(style)) {
          setProfile({ ...profile, learningStyle: current.filter(s => s !== style) });
      } else {
          setProfile({ ...profile, learningStyle: [...current, style] });
      }
  };

  const toggleTransportMode = (mode: TransportMode) => {
      const current = profile.transportMode;
      if (current.includes(mode)) {
          setProfile({ ...profile, transportMode: current.filter(m => m !== mode) });
      } else {
          setProfile({ ...profile, transportMode: [...current, mode] });
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-jalanea-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-jalanea-900">My Profile</h1>
          <p className="text-jalanea-600 font-medium mt-1">Manage your Experience, Education, and Skills</p>
        </div>
      </div>

      <div className="flex items-center justify-between sticky top-4 z-30 bg-jalanea-50/90 backdrop-blur-sm p-2 rounded-xl border border-jalanea-200 shadow-sm">
        <h2 className="text-xl font-bold text-jalanea-900 pl-2">Career Data</h2>
        {isEditing ? (
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancel} icon={<X size={16} />}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleSave} icon={<Save size={16} />}>Save Changes</Button>
            </div>
        ) : (
            <Button size="sm" onClick={() => setIsEditing(true)} icon={<Edit3 size={16} />}>Edit Profile</Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="solid-white" className="p-6">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Heart size={14} /> Basic Info
              </h3>
              {isEditing ? (
                  <div className="space-y-4">
                      <Input label="Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                      <Input label="Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                      <Input label="Location" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
                  </div>
              ) : (
                  <div className="space-y-2">
                      <div className="text-lg font-bold text-jalanea-900">{profile.name}</div>
                      <div className="text-sm text-jalanea-600">{profile.email}</div>
                      <div className="flex items-center gap-1 text-sm text-jalanea-500"><MapPin size={14}/> {profile.location}</div>
                  </div>
              )}
          </Card>
          
          <Card variant="solid-white" className="p-6">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <MapPin size={14} /> Preferences
              </h3>
              
              <div className="space-y-6">
                  <div>
                      <span className="text-xs font-bold text-jalanea-400 uppercase block mb-2">Learning Style</span>
                      <div className="flex flex-wrap gap-2">
                          {(['Video', 'Reading'] as LearningStyle[]).map(style => (
                              <button
                                key={style}
                                onClick={() => isEditing && toggleLearningStyle(style)}
                                disabled={!isEditing}
                                className={`
                                    px-3 py-1 rounded-full text-xs font-bold border transition-colors
                                    ${profile.learningStyle.includes(style) 
                                        ? 'bg-jalanea-900 text-white border-jalanea-900' 
                                        : 'bg-white text-jalanea-500 border-jalanea-200'}
                                    ${isEditing ? 'cursor-pointer hover:border-gold' : 'cursor-default'}
                                `}
                              >
                                  {style}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div>
                      <span className="text-xs font-bold text-jalanea-400 uppercase block mb-2">Transport</span>
                      <div className="flex flex-wrap gap-2">
                          {(['Car', 'Bus', 'Bike', 'Walk', 'Uber'] as TransportMode[]).map(mode => (
                              <button
                                key={mode}
                                onClick={() => isEditing && toggleTransportMode(mode)}
                                disabled={!isEditing}
                                className={`
                                    px-3 py-1 rounded-full text-xs font-bold border transition-colors
                                    ${profile.transportMode.includes(mode) 
                                        ? 'bg-jalanea-900 text-white border-jalanea-900' 
                                        : 'bg-white text-jalanea-500 border-jalanea-200'}
                                    ${isEditing ? 'cursor-pointer hover:border-gold' : 'cursor-default'}
                                `}
                              >
                                  {mode}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </Card>
      </div>

      {/* ... Education, Experience, Skills, Certs sections remain unchanged ... */}
      <div className="space-y-6">
        
        {/* Education Section */}
        <Card variant="solid-white" className="overflow-hidden">
          <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={16} /> Education
            </h3>
            {isEditing && <Button size="sm" variant="ghost" onClick={addEducation} icon={<Plus size={14}/>}>Add</Button>}
          </div>
          <div className="p-6 space-y-6">
            {profile.education.map((edu, idx) => (
              <div key={idx} className={`flex flex-col gap-2 relative ${isEditing ? 'p-4 border border-jalanea-200 rounded-xl bg-jalanea-50' : 'md:flex-row md:items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg transition-colors'}`}>
                {isEditing && (
                    <button onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-jalanea-400 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                )}
                {isEditing ? (
                    <div className="space-y-3 pt-2">
                        <Input label="Degree" value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="School" value={edu.school} onChange={(e) => updateEducation(idx, 'school', e.target.value)} />
                            <Input label="Year" value={edu.year} onChange={(e) => updateEducation(idx, 'year', e.target.value)} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                        <h4 className="text-sm font-bold text-jalanea-900">{edu.degree}</h4>
                        <p className="text-sm text-jalanea-600">{edu.school}</p>
                        </div>
                        {edu.gpa && (
                        <span className="mt-2 md:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold/10 text-jalanea-800 border border-gold/20">
                            {edu.gpa} GPA
                        </span>
                        )}
                    </>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Experience Section */}
        <Card variant="solid-white" className="overflow-hidden">
          <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} /> Experience
            </h3>
            {isEditing && <Button size="sm" variant="ghost" onClick={addExperience} icon={<Plus size={14}/>}>Add</Button>}
          </div>
          <div className="p-6 space-y-8">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className={isEditing ? "space-y-3 p-4 border border-jalanea-200 rounded-xl bg-jalanea-50 relative" : "relative pl-6 border-l-2 border-jalanea-200 last:border-0 pb-2"}>
                
                {isEditing && (
                    <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-jalanea-400 hover:text-red-500 z-10">
                        <Trash2 size={16} />
                    </button>
                )}

                {isEditing ? (
                    <div className="space-y-3 pt-2">
                        <Input label="Role" value={exp.role} onChange={e => updateExperience(idx, 'role', e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Company" value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} />
                            <Input label="Duration" value={exp.duration} onChange={e => updateExperience(idx, 'duration', e.target.value)} />
                        </div>
                        <textarea 
                            className="w-full border rounded-lg p-2 text-sm" 
                            placeholder="Description bullet points (one per line)"
                            rows={3}
                            value={exp.description.join('\n')}
                            onChange={e => {
                                const newExp = [...profile.experience];
                                newExp[idx].description = e.target.value.split('\n');
                                setProfile({ ...profile, experience: newExp });
                            }}
                        />
                    </div>
                ) : (
                    <>
                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-jalanea-50 border-2 border-jalanea-300 rounded-full"></div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                        <h4 className="text-base font-bold text-jalanea-900">{exp.role} <span className="text-jalanea-400 font-normal">at</span> {exp.company}</h4>
                        <span className="text-xs font-bold text-jalanea-500 bg-jalanea-100 px-2 py-1 rounded">{exp.duration}</span>
                        </div>
                        <ul className="space-y-1.5 mt-3">
                        {exp.description.map((point, i) => (
                            <li key={i} className="text-sm text-jalanea-700 leading-relaxed flex items-start gap-2">
                            <span className="text-jalanea-400 mt-1.5 text-[8px]">•</span>
                            <span>{point}</span>
                            </li>
                        ))}
                        </ul>
                    </>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="solid-white" className="h-full">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <PenTool size={16} /> Skills
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {(['technical', 'design', 'soft'] as const).map(category => (
                  <div key={category}>
                      <h4 className="text-xs font-bold text-jalanea-900 mb-2 capitalize">{category}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                          {profile.skills[category].map(skill => (
                              <span key={skill} className="text-xs font-medium px-2 py-1 bg-jalanea-50 text-jalanea-700 rounded border border-jalanea-100 flex items-center gap-1 group">
                                  {skill}
                                  {isEditing && (
                                      <button onClick={() => removeSkill(category, skill)} className="text-jalanea-400 hover:text-red-500"><X size={10} /></button>
                                  )}
                              </span>
                          ))}
                      </div>
                      {isEditing && (
                          <div className="flex gap-2">
                              <input 
                                  className="flex-1 text-xs border rounded px-2 py-1" 
                                  placeholder={`Add ${category} skill...`}
                                  value={newSkill}
                                  onChange={e => setNewSkill(e.target.value)}
                                  onKeyDown={e => {
                                      if(e.key === 'Enter') addSkill(category);
                                  }}
                              />
                              <Button size="sm" variant="ghost" onClick={() => addSkill(category)} disabled={!newSkill}><Plus size={14}/></Button>
                          </div>
                      )}
                  </div>
              ))}
            </div>
          </Card>

          <Card variant="solid-white" className="h-full">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} /> Licenses & Certs
              </h3>
              {isEditing && <Button size="sm" variant="ghost" onClick={addCertification} icon={<Plus size={14}/>}>Add</Button>}
            </div>
            <div className="p-6 space-y-4">
              {profile.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-3 group relative">
                  {isEditing ? (
                      <div className="flex-1 space-y-2 p-3 bg-jalanea-50 rounded-lg border border-jalanea-100">
                          <button onClick={() => removeCertification(idx)} className="absolute top-2 right-2 text-jalanea-400 hover:text-red-500"><Trash2 size={14}/></button>
                          <Input className="text-sm" placeholder="Certificate Name" value={cert.name} onChange={e => updateCertification(idx, 'name', e.target.value)} />
                          <Input className="text-sm" placeholder="Issuer" value={cert.issuer} onChange={e => updateCertification(idx, 'issuer', e.target.value)} />
                      </div>
                  ) : (
                      <>
                        <div className="mt-1">
                            <Award size={16} className="text-gold" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-jalanea-900">{cert.name}</h4>
                            <p className="text-xs text-jalanea-500">{cert.issuer}</p>
                        </div>
                      </>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
