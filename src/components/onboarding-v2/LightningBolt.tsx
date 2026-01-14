'use client'

/**
 * LightningBolt - Brand animation component
 * Displays a lightning bolt animation when user progresses
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface LightningBoltProps {
  show: boolean
}

export function LightningBolt({ show }: LightningBoltProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -20 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Zap
              size={80}
              className="text-[#ffc425] drop-shadow-[0_0_30px_rgba(255,196,37,0.8)]"
              fill="#ffc425"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LightningBolt
