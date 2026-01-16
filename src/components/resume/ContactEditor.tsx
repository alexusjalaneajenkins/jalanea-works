'use client'

/**
 * ContactEditor - Edit contact information section
 */

import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe
} from 'lucide-react'
import { type ContactInfo } from './types'

interface ContactEditorProps {
  contact: ContactInfo
  onChange: (contact: ContactInfo) => void
}

interface InputFieldProps {
  icon: React.ElementType
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  required?: boolean
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ffc425]/50 focus:border-transparent"
        />
      </div>
    </div>
  )
}

export function ContactEditor({ contact, onChange }: ContactEditorProps) {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onChange({ ...contact, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          icon={User}
          label="First Name"
          value={contact.firstName}
          onChange={(v) => handleChange('firstName', v)}
          placeholder="John"
          required
        />
        <InputField
          icon={User}
          label="Last Name"
          value={contact.lastName}
          onChange={(v) => handleChange('lastName', v)}
          placeholder="Doe"
          required
        />
      </div>

      <InputField
        icon={Mail}
        label="Email"
        value={contact.email}
        onChange={(v) => handleChange('email', v)}
        placeholder="john.doe@email.com"
        type="email"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          icon={Phone}
          label="Phone"
          value={contact.phone}
          onChange={(v) => handleChange('phone', v)}
          placeholder="(407) 555-0123"
          type="tel"
          required
        />
        <InputField
          icon={MapPin}
          label="Location"
          value={contact.location}
          onChange={(v) => handleChange('location', v)}
          placeholder="Orlando, FL"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          icon={Linkedin}
          label="LinkedIn (optional)"
          value={contact.linkedin || ''}
          onChange={(v) => handleChange('linkedin', v)}
          placeholder="linkedin.com/in/johndoe"
        />
        <InputField
          icon={Globe}
          label="Website (optional)"
          value={contact.website || ''}
          onChange={(v) => handleChange('website', v)}
          placeholder="johndoe.com"
        />
      </div>
    </div>
  )
}

export default ContactEditor
