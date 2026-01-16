'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/auth/AuthModal'
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isAuthOpen, setIsAuthOpen] = useState(true)

  // If user closes the modal, redirect to home
  const handleClose = () => {
    setIsAuthOpen(false)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Logo watermark */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-2xl tracking-tighter text-white/20">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Zap size={20} className="text-white/20" />
          </div>
          <span>Jalanea<span className="text-[#ffc425]/20">Works</span></span>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleClose}
        initialMode="signin"
      />
    </div>
  )
}
