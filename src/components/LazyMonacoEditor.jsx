import { lazy, Suspense, useState, useEffect } from 'react'

// Lazy load icons và monaco config
const LoaderIcon = lazy(() => import('react-feather').then(m => ({ default: m.RefreshCw })))

// Lazy load monaco config
let monacoConfigLoaded = false
const loadMonacoConfig = async () => {
  if (!monacoConfigLoaded) {
    await import('../monaco-config')
    monacoConfigLoaded = true
  }
}

const Editor = lazy(() => import('@monaco-editor/react'))

export default function LazyMonacoEditor({ 
  shouldLoad = true,
  ...props 
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (shouldLoad) {
      setIsMounted(true)
    }
  }, [shouldLoad])

  useEffect(() => {
    if (shouldLoad && isMounted) {
      loadMonacoConfig()
    }
  }, [shouldLoad, isMounted])

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full bg-bw-gray-1 dark:bg-bw-gray-1">
      <div className="flex flex-col items-center gap-2 text-bw-gray-6 dark:text-bw-gray-5">
        <Suspense fallback={<div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />}>
          <LoaderIcon size={24} className="animate-spin" />
        </Suspense>
        <span className="text-xs">Loading editor...</span>
      </div>
    </div>
  )

  if (!shouldLoad || !isMounted) {
    return <LoadingFallback />
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Editor {...props} />
    </Suspense>
  )
}

