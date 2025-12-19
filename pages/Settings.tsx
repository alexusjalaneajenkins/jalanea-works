
import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UserProfile } from '../types';
import { GraduationCap, Briefcase, Award, PenTool, Edit3 } from 'lucide-react';

// Mock Profile Data matching the screenshot
export const MOCK_PROFILE: UserProfile = {
  fullName: "Alex Doe",
  name: "Alex Doe",
  email: "alex.doe@valenciacollege.edu",
  location: "Orlando, FL",
  photoURL: "", // Added to match type
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
        "Identified navigation challenges and proposed a new tooltip system to reduce user confusion.",
        "Designed three tooltip variations (text, image, video) and documented their pros, cons, benefits, and use cases.",
        "Created animated UI mockups and delivered a full proposal directly to the President of the company.",
        "Contributed UI updates and quality of life improvements to PETE Learning's course builder."
      ]
    },
    {
      role: "Kid Coordinator (Imagination Station)",
      company: "Mosaic Church",
      duration: "Jun 2024 - Aug 2024",
      description: [
        "Coordinated 9 rotating activity stations for over 120 children during Mosaic Church's summer program.",
        "Developed hands-on learning activities using various materials to engage kids creatively.",
        "Adapted lessons in real-time to ensure all children received individual attention and support.",
        "Collaborated with a team of volunteers to maintain a safe and fun environment."
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
    { name: "Microsoft Office Specialist (Word, Excel, PowerPoint)", issuer: "Microsoft" },
    { name: "Entrepreneurship & Small Business", issuer: "Microsoft" }
  ],
  // Flattened Preferences
  targetRoles: [],
  workStyles: [],
  learningStyle: ['Both'],
  transportMode: ['Car'],
  salary: 0,

  // Flattened Logistics
  isParent: false,
  employmentStatus: 'Part-time',
  onboardingCompleted: true,
  updatedAt: new Date().toISOString()
};

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-jalanea-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-jalanea-900">Profile Manager</h1>
          <p className="text-jalanea-600 font-medium mt-1">Manage your Experience, Education, and Skills</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-jalanea-900">My Career Data</h2>
        <Button size="sm" icon={<Edit3 size={16} />}>Edit Profile</Button>
      </div>

      <div className="space-y-6">

        {/* Education Section */}
        <Card variant="solid-white" className="overflow-hidden">
          <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
            <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap size={16} /> Education
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_PROFILE.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3 hover:bg-jalanea-50 rounded-lg transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-jalanea-900">{edu.degree}</h4>
                  <p className="text-sm text-jalanea-600">{edu.school}</p>
                </div>
                {edu.gpa && (
                  <span className="mt-2 md:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold/10 text-jalanea-800 border border-gold/20">
                    {edu.gpa} GPA
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Experience Section */}
        <Card variant="solid-white" className="overflow-hidden">
          <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
            <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} /> Experience
            </h3>
          </div>
          <div className="p-6 space-y-8">
            {MOCK_PROFILE.experience.map((exp, idx) => (
              <div key={idx} className="relative pl-6 border-l-2 border-jalanea-200 last:border-0 pb-2">
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
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Section */}
          <Card variant="solid-white" className="h-full">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <PenTool size={16} /> Skills
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-jalanea-900 mb-2">Technical</h4>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROFILE.skills.technical.map(skill => (
                    <span key={skill} className="text-xs font-medium px-2 py-1 bg-jalanea-50 text-jalanea-700 rounded border border-jalanea-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-jalanea-900 mb-2">Design</h4>
                <div className="flex flex-wrap gap-2">
                  {MOCK_PROFILE.skills.design.map(skill => (
                    <span key={skill} className="text-xs font-medium px-2 py-1 bg-jalanea-50 text-jalanea-700 rounded border border-jalanea-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-jalanea-900 mb-2">Soft Skills</h4>
                <div className="text-sm text-jalanea-600 leading-relaxed">
                  {MOCK_PROFILE.skills.soft.join(", ")}
                </div>
              </div>
            </div>
          </Card>

          {/* Licenses & Certs Section */}
          <Card variant="solid-white" className="h-full">
            <div className="border-b border-jalanea-100 p-6 bg-jalanea-50/50">
              <h3 className="text-xs font-bold text-jalanea-500 uppercase tracking-wider flex items-center gap-2">
                <Award size={16} /> Licenses & Certs
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {MOCK_PROFILE.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1">
                    <Award size={16} className="text-gold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-jalanea-900">{cert.name}</h4>
                    <p className="text-xs text-jalanea-500">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
