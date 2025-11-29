import { lazy, Suspense, useState, useEffect } from 'react'
import { Loader } from 'react-feather'
import '../monaco-config'

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

  if (!shouldLoad || !isMounted) {
    return (
      <div className="flex items-center justify-center h-full bg-bw-gray-1 dark:bg-bw-gray-1">
        <div className="flex flex-col items-center gap-2 text-bw-gray-6 dark:text-bw-gray-5">
          <Loader size={24} className="animate-spin" />
          <span className="text-xs">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full bg-bw-gray-1 dark:bg-bw-gray-1">
          <div className="flex flex-col items-center gap-2 text-bw-gray-6 dark:text-bw-gray-5">
            <Loader size={24} className="animate-spin" />
            <span className="text-xs">Loading editor...</span>
          </div>
        </div>
      }
    >
      <Editor {...props} />
    </Suspense>
  )
}

