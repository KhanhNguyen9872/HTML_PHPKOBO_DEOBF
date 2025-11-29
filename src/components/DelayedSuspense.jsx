import { useState, useEffect, Suspense, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function DelayedSuspense({ 
  children, 
  fallback, 
  delay = 800 
}) {
  const [showContent, setShowContent] = useState(false)
  const resolvedRef = useRef(false)
  const [isResolved, setIsResolved] = useState(false)

  useEffect(() => {
    if (isResolved && !resolvedRef.current) {
      resolvedRef.current = true
      const timer = setTimeout(() => {
        setShowContent(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isResolved, delay])

  return (
    <div style={{ position: 'relative' }}>
      <Suspense fallback={null}>
        <ResolveDetector onResolved={() => setIsResolved(true)} />
        <div style={{ visibility: showContent ? 'visible' : 'hidden' }}>
          {children}
        </div>
      </Suspense>
      <AnimatePresence mode="wait">
        {!showContent && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
          >
            {fallback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResolveDetector({ onResolved }) {
  useEffect(() => {
    onResolved()
  }, [onResolved])
  return null
}
