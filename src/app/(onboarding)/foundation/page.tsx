'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { useTranslation } from '@/i18n/config'
import { MapPin, User, ChevronRight, ChevronDown, ChevronUp, Locate, Link2, Linkedin, Globe } from 'lucide-react'
import { CredentialStack } from '@/components/onboarding/CredentialStack'
import { FormError } from '@/components/ui/FormError'
import { validateFoundation } from '@/lib/validation/onboarding'
import type { Locale } from '@/i18n/config'

export default function FoundationPage() {
  const router = useRouter()
  const { data, updateData, setCurrentStep } = useOnboarding()
  const { t, locale } = useTranslation(data.preferredLanguage)
  const [showOptional, setShowOptional] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  const handleLanguageSelect = (lang: Locale) => {
    updateData({ preferredLanguage: lang })
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(locale === 'es' ? 'Geolocalización no soportada' : 'Geolocation not supported')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        updateData({
          addressCoords: { lat: latitude, lng: longitude },
        })

        // Reverse geocode using a free API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          if (response.ok) {
            const result = await response.json()
            const city = result.address?.city || result.address?.town || result.address?.village || ''
            const state = result.address?.state || ''
            const displayAddress = [city, state].filter(Boolean).join(', ')
            if (displayAddress) {
              updateData({ address: displayAddress })
            }
          }
        } catch {
          // Silently fail geocoding, we still have coordinates
        }

        setIsLocating(false)
      },
      (error) => {
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(locale === 'es' ? 'Permiso de ubicación denegado' : 'Location permission denied')
        } else {
          setLocationError(locale === 'es' ? 'No se pudo obtener ubicación' : 'Could not get location')
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  // Track if user has attempted to submit (to show errors)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Validate form data using Zod schema
  const validation = useMemo(() => {
    return validateFoundation({
      preferredLanguage: data.preferredLanguage,
      fullName: data.fullName,
      address: data.address,
      addressCoords: data.addressCoords,
      linkedInUrl: data.linkedInUrl,
      portfolioUrl: data.portfolioUrl,
      credentials: data.credentials,
    })
  }, [data.preferredLanguage, data.fullName, data.address, data.addressCoords, data.linkedInUrl, data.portfolioUrl, data.credentials])

  // Get specific field errors
  const getFieldError = (field: string) => {
    if (!hasAttemptedSubmit || validation.success) return undefined
    const error = validation.error?.errors.find(e => e.path[0] === field)
    return error?.message
  }

  // Validation: need name, address, and at least one credential
  const canContinue = validation.success

  const handleContinue = () => {
    setHasAttemptedSubmit(true)
    if (canContinue) {
      router.push('/transportation')
    }
  }

  return (
    <div className="space-y-6">
      {/* Language Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
          {locale === 'es' ? 'Idioma / Language' : 'Language / Idioma'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLanguageSelect('en')}
            className={`language-btn px-4 py-4 rounded-xl border-2 font-bold text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              data.preferredLanguage === 'en'
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageSelect('es')}
            className={`language-btn px-4 py-4 rounded-xl border-2 font-bold text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
              data.preferredLanguage === 'es'
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            Español
          </button>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <User className="w-4 h-4" />
          {t('onboarding.foundation.fullName')}
        </label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder={locale === 'es' ? 'Nombre completo' : 'Your full name'}
          className={`w-full px-4 py-3.5 min-h-[44px] border rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
            getFieldError('fullName') ? 'border-red-500' : 'border-slate-300'
          }`}
        />
        <FormError message={getFieldError('fullName')} />
      </div>

      {/* Location Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <MapPin className="w-4 h-4" />
          {t('onboarding.foundation.address')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            placeholder={locale === 'es' ? 'Ciudad, Estado' : 'City, State'}
            className={`flex-1 px-4 py-3.5 min-h-[44px] border rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
              getFieldError('address') ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="px-4 min-h-[44px] min-w-[44px] border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
            aria-label={locale === 'es' ? 'Usar mi ubicación' : 'Use my location'}
          >
            <Locate className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        {locationError && (
          <p className="text-xs text-red-500">{locationError}</p>
        )}
        <FormError message={getFieldError('address')} />
        <p className="text-xs text-slate-500">
          {t('onboarding.foundation.addressHint')}
        </p>
      </div>

      {/* Education / Credentials */}
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
          {t('onboarding.foundation.education')}
        </label>
        <CredentialStack
          credentials={data.credentials}
          onChange={(credentials) => updateData({ credentials })}
          locale={locale}
        />
        <FormError message={getFieldError('credentials')} />
      </div>

      {/* Optional Fields Accordion */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full px-4 py-3.5 min-h-[44px] flex items-center justify-between text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
        >
          <span className="text-sm font-medium">
            {locale === 'es' ? 'Campos opcionales' : 'Optional fields'}
          </span>
          {showOptional ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showOptional && (
          <div className="px-4 pb-4 space-y-4 animate-slide-up">
            {/* LinkedIn URL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Linkedin className="w-4 h-4" />
                LinkedIn URL
              </label>
              <input
                type="url"
                value={data.linkedInUrl}
                onChange={(e) => updateData({ linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-4 py-3.5 min-h-[44px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <Link2 className="w-4 h-4" />
                {locale === 'es' ? 'Portafolio / Sitio web' : 'Portfolio / Website'}
              </label>
              <input
                type="url"
                value={data.portfolioUrl}
                onChange={(e) => updateData({ portfolioUrl: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3.5 min-h-[44px] border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full min-h-[44px] py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {t('onboarding.common.continue')}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
