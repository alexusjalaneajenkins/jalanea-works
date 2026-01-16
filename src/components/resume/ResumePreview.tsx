'use client'

/**
 * ResumePreview - Live preview of the resume with template styling
 */

import { type Resume, type ResumeTemplate, templateConfig } from './types'

interface ResumePreviewProps {
  resume: Resume
  scale?: number
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + '-01')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function ResumePreview({ resume, scale = 1 }: ResumePreviewProps) {
  const config = templateConfig[resume.template]
  const { colors } = config

  return (
    <div
      className="bg-white text-black shadow-xl"
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '0.75in',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        fontFamily: resume.template === 'modern' ? 'system-ui' : 'Georgia, serif'
      }}
    >
      {/* Header / Contact */}
      <header
        className="mb-6 pb-4"
        style={{ borderBottom: `2px solid ${colors.primary}` }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primary }}
        >
          {resume.contact.firstName || 'Your'} {resume.contact.lastName || 'Name'}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: colors.muted }}>
          {resume.contact.email && <span>{resume.contact.email}</span>}
          {resume.contact.phone && <span>{resume.contact.phone}</span>}
          {resume.contact.location && <span>{resume.contact.location}</span>}
          {resume.contact.linkedin && (
            <span style={{ color: colors.secondary }}>{resume.contact.linkedin}</span>
          )}
          {resume.contact.website && (
            <span style={{ color: colors.secondary }}>{resume.contact.website}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className="mb-5">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-2"
            style={{ color: colors.primary }}
          >
            Professional Summary
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
            {resume.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-3"
            style={{ color: colors.primary }}
          >
            Work Experience
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold" style={{ color: colors.text }}>
                      {exp.title || 'Job Title'}
                    </h3>
                    <p className="text-sm" style={{ color: colors.secondary }}>
                      {exp.company || 'Company'}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                  </div>
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                  </span>
                </div>
                {exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-5 text-sm space-y-1 mt-2">
                    {exp.highlights.filter(h => h.trim()).map((highlight, i) => (
                      <li key={i} style={{ color: colors.text }}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-3"
            style={{ color: colors.primary }}
          >
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold" style={{ color: colors.text }}>
                      {edu.degree || 'Degree'}
                      {edu.field && ` in ${edu.field}`}
                    </h3>
                    <p className="text-sm" style={{ color: colors.secondary }}>
                      {edu.school || 'School'}
                      {edu.location && ` • ${edu.location}`}
                    </p>
                    {(edu.gpa || edu.honors) && (
                      <p className="text-sm" style={{ color: colors.muted }}>
                        {edu.gpa && `GPA: ${edu.gpa}`}
                        {edu.gpa && edu.honors && ' • '}
                        {edu.honors}
                      </p>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {formatDate(edu.graduationDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-2"
            style={{ color: colors.primary }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill.id}
                className="text-sm px-2 py-0.5 rounded"
                style={{
                  backgroundColor: resume.template === 'modern'
                    ? `${colors.secondary}20`
                    : `${colors.primary}10`,
                  color: resume.template === 'modern' ? colors.secondary : colors.primary
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-2"
            style={{ color: colors.primary }}
          >
            Certifications
          </h2>
          <div className="space-y-1">
            {resume.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between text-sm">
                <span style={{ color: colors.text }}>
                  <strong>{cert.name}</strong> - {cert.issuer}
                </span>
                <span style={{ color: colors.muted }}>{formatDate(cert.date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="mb-5">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-3"
            style={{ color: colors.primary }}
          >
            Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-bold" style={{ color: colors.text }}>
                  {project.name}
                  {project.link && (
                    <span className="font-normal text-sm ml-2" style={{ color: colors.secondary }}>
                      ({project.link})
                    </span>
                  )}
                </h3>
                <p className="text-sm" style={{ color: colors.text }}>
                  {project.description}
                </p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-sm mt-1" style={{ color: colors.muted }}>
                    Technologies: {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ResumePreview
