import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

function HTMLExecutor({ html, reloadKey, viewMode, customWidth, customHeight, onWidthChange, onHeightChange, onLoad, shouldLoad, darkMode, blockNetwork }) {
  const [iframeContent, setIframeContent] = useState('')
  const [iframeStyle, setIframeStyle] = useState({})
  const [iframeKey, setIframeKey] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const iframeRef = useRef(null)
  const containerRef = useRef(null)
  const contentTimeoutRef = useRef(null)
  const helperAttrRef = useRef(`data-preview-helper-${Math.random().toString(36).slice(2, 16)}`)

  const stripPreviewHelpers = (htmlString) => {
    if (!htmlString) return htmlString
    const helperAttr = helperAttrRef.current
    const escapedAttr = helperAttr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const scriptRegex = new RegExp(`<script[^>]*${escapedAttr}="true"[^>]*>[\\s\\S]*?<\\/script>`, 'gi')
    const styleRegex = new RegExp(`<style[^>]*${escapedAttr}="true"[^>]*>[\\s\\S]*?<\\/style>`, 'gi')
    return htmlString
      .replace(scriptRegex, '')
      .replace(styleRegex, '')
  }

  const ensureDoctype = (htmlString) => {
    if (!htmlString) return htmlString
    const trimmedStart = htmlString.trimStart()
    if (trimmedStart.toLowerCase().startsWith('<!doctype')) {
      return htmlString
    }
    return `<!DOCTYPE html>\n${htmlString}`
  }

  const integrateRemovedScripts = (htmlString) => {
    try {
      if (!iframeRef.current || !htmlString) return htmlString
      const iframeWindow = iframeRef.current.contentWindow
      const removedScripts = iframeWindow?.__removedScripts
      if (!removedScripts || removedScripts.length <= 2) {
        if (iframeWindow) {
          iframeWindow.__removedScripts = removedScripts?.slice(0, 2) || []
        }
        return htmlString
      }
      const scriptsCombined = removedScripts.slice(2).filter(Boolean).join('\n')
      if (!scriptsCombined.trim()) return htmlString
      if (iframeWindow) {
        iframeWindow.__removedScripts = []
      }
      if (htmlString.includes('</body>')) {
        return htmlString.replace('</body>', `${scriptsCombined}\n</body>`)
      }
      return `${htmlString}\n${scriptsCombined}`
    } catch (error) {
      return htmlString
    }
  }

  const getIframeContentString = () => {
    try {
      if (!iframeRef.current) return ''
      const doc = iframeRef.current.contentDocument
      if (!doc) return ''
      const clonedDoc = doc.documentElement ? doc.documentElement.cloneNode(true) : null
      if (clonedDoc) {
        return ensureDoctype(integrateRemovedScripts(stripPreviewHelpers(clonedDoc.outerHTML || '')))
      }
      if (doc.documentElement) {
        return ensureDoctype(integrateRemovedScripts(stripPreviewHelpers(doc.documentElement.outerHTML || '')))
      }
      const fallback = doc.body ? doc.body.innerHTML || '' : ''
      return ensureDoctype(integrateRemovedScripts(stripPreviewHelpers((fallback))))
    } catch (error) {
      return ''
    }
  }

  const notifyParentWithContent = () => {
    if (!onLoad) return
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current)
    }
    contentTimeoutRef.current = setTimeout(() => {
      onLoad(getIframeContentString())
      contentTimeoutRef.current = null
    }, 2000)
  }

  useEffect(() => {
    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current)
      }
    }
  }, [])
  const resizeStateRef = useRef({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    side: null
  })

  useEffect(() => {
    // Chỉ load HTML khi shouldLoad = true (container đã hiển thị)
    if (!shouldLoad) {
      setIframeContent('')
      setHasLoaded(false)
      return
    }

    // Reset hasLoaded khi bắt đầu load mới
    setHasLoaded(false)

    // Chỉ set viewport width khi viewMode thay đổi, không phải khi customWidth thay đổi
    // Khi resize custom mode, chỉ resize container, không reload iframe
    const viewportWidth = viewMode === 'custom'
      ? customWidth
      : viewMode === 'mobile'
        ? 375
        : viewMode === 'tablet'
          ? 768
          : 'device-width'
    const helperAttr = helperAttrRef.current
    const networkGuardSnippet = blockNetwork ? `
  <script ${helperAttr}="true">
    (function() {
      const message = 'Network requests bị chặn trong chế độ preview.'
      const rejectPromise = () => Promise.reject(new Error(message))
      const logBlocked = (api) => console.warn('[Preview]', api, 'đã bị chặn.')
      
      const blockedFetch = (...args) => {
        logBlocked('fetch')
        return rejectPromise()
      }
      window.fetch = blockedFetch
      window.Request = window.Request || function() {}
      window.Response = window.Response || function() {}
      window.XMLHttpRequest = function() {
        logBlocked('XMLHttpRequest')
        return {
          open() {},
          setRequestHeader() {},
          abort() {},
          get readyState() { return 0 },
          get responseText() { return '' },
          get response() { return null },
          get status() { return 0 },
          send() {
            logBlocked('XMLHttpRequest.send')
            throw new Error(message)
          }
        }
      }
      if (window.navigator && typeof window.navigator.sendBeacon === 'function') {
        window.navigator.sendBeacon = function() {
          logBlocked('navigator.sendBeacon')
          return false
        }
      }
      if (window.WebSocket) {
        window.WebSocket = function() {
          logBlocked('WebSocket')
          throw new Error(message)
        }
      }
    })();
  </script>
    ` : ''
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${viewportWidth}, initial-scale=1.0">
  <style ${helperAttr}="true">
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      overflow-x: auto;
      overflow-y: auto;
    }
  </style>
  <script ${helperAttr}="true">
    const helperScript = document.querySelector('[${helperAttr}="true"]');

    document.addEventListener('DOMContentLoaded', function() {
      document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target && target.href) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);
      
      document.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);

      if (helperScript) {
        helperScript.remove();
      }
    });

    window.__removedScripts = [];

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const removed of m.removedNodes) {
                if (removed.tagName === "SCRIPT") {
                    window.__removedScripts.push(removed.outerHTML);
                }
            }
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
    
  </script>
  ${networkGuardSnippet}
</head>
<body>
  ${html}
</body>
</html>
    `
    // Delay một chút để đảm bảo container đã render
    const timer = setTimeout(() => {
      setIframeContent(fullHtml)
      setIframeKey(prev => prev + 1)
    }, 200)
    
    return () => clearTimeout(timer)
    // Loại bỏ customWidth khỏi dependencies - chỉ reload khi html, viewMode, hoặc shouldLoad thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, viewMode, shouldLoad, reloadKey, blockNetwork])

  // Đảm bảo onLoad được gọi khi iframe load xong
  useEffect(() => {
    if (iframeRef.current && iframeContent && shouldLoad && !hasLoaded) {
      const iframe = iframeRef.current
      const checkLoad = () => {
        try {
          // Kiểm tra xem iframe đã load xong chưa
          if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            if (onLoad && !hasLoaded) {
              setHasLoaded(true)
              notifyParentWithContent()
            }
          }
        } catch (e) {
          // Cross-origin error, nhưng vẫn có thể gọi onLoad
          if (onLoad && !hasLoaded) {
            setHasLoaded(true)
            notifyParentWithContent()
          }
        }
      }
      
      // Thử gọi ngay
      checkLoad()
      
      // Nếu chưa load, đợi thêm một chút
      const timeout = setTimeout(() => {
        if (!hasLoaded && onLoad) {
          setHasLoaded(true)
          notifyParentWithContent()
        }
      }, 500)
      
      return () => clearTimeout(timeout)
    }
  }, [iframeContent, shouldLoad, hasLoaded, onLoad])

  useEffect(() => {
    if (viewMode === 'mobile') {
      setIframeStyle({
        width: '375px',
        height: '667px',
        margin: '0 auto',
        border: '1px solid #dddddd',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      })
    } else if (viewMode === 'tablet') {
      setIframeStyle({
        width: '768px',
        height: '1024px',
        margin: '0 auto',
        border: '1px solid #dddddd',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      })
    } else if (viewMode === 'desktop') {
      setIframeStyle({
        width: '100%',
        height: '100%'
      })
    } else if (viewMode === 'custom') {
      // Iframe container lớn hơn để hiển thị content với viewport nhỏ hơn
      const containerWidth = Math.max(customWidth + 100, 800)
      setIframeStyle({
        width: `${containerWidth}px`,
        height: `${customHeight}px`,
        margin: '0 auto',
        border: '1px solid #dddddd',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative'
      })
    }
  }, [viewMode, customWidth, customHeight])

  const handleMouseDown = (e, side) => {
    if (viewMode !== 'custom') return
    e.preventDefault()
    e.stopPropagation()
    
    resizeStateRef.current.isResizing = true
    resizeStateRef.current.side = side
    resizeStateRef.current.startX = e.clientX
    resizeStateRef.current.startY = e.clientY
    resizeStateRef.current.startWidth = customWidth
    resizeStateRef.current.startHeight = customHeight

    const handleMouseMove = (e) => {
      if (!resizeStateRef.current.isResizing) return
      e.preventDefault()
      
      // Handle width resize (left, right)
      if (resizeStateRef.current.side === 'left' || resizeStateRef.current.side === 'right') {
        const diff = e.clientX - resizeStateRef.current.startX
        let newWidth
        if (resizeStateRef.current.side === 'left') {
          newWidth = Math.max(200, Math.min(3000, resizeStateRef.current.startWidth - diff))
        } else {
          newWidth = Math.max(200, Math.min(3000, resizeStateRef.current.startWidth + diff))
        }
        if (onWidthChange) {
          onWidthChange(newWidth)
        }
      }
      
      // Handle height resize (top, bottom)
      if (resizeStateRef.current.side === 'top' || resizeStateRef.current.side === 'bottom') {
        const diff = e.clientY - resizeStateRef.current.startY
        let newHeight
        if (resizeStateRef.current.side === 'top') {
          newHeight = Math.max(200, Math.min(3000, resizeStateRef.current.startHeight - diff))
        } else {
          newHeight = Math.max(200, Math.min(3000, resizeStateRef.current.startHeight + diff))
        }
        if (onHeightChange) {
          onHeightChange(newHeight)
        }
      }
    }

    const handleMouseUp = (e) => {
      e.preventDefault()
      resizeStateRef.current.isResizing = false
      resizeStateRef.current.side = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = side === 'left' || side === 'right' ? 'ew-resize' : 'ns-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp, { passive: false })
  }

  return (
    <motion.div 
      className={`bg-bw-gray-f dark:bg-bw-gray-1 select-none ${
        viewMode === 'desktop' 
          ? 'flex-1 flex overflow-auto min-h-0' 
          : 'flex-1 overflow-auto flex justify-center items-start p-5 relative'
      }`}
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={viewMode === 'desktop' ? { 
        minHeight: 0, 
        height: '100%',
        flex: '1 1 0%',
        display: 'flex',
        flexDirection: 'column'
      } : {}}
    >
      {viewMode === 'desktop' ? (
        <iframe
          ref={iframeRef}
          key={`iframe-${iframeKey}`}
          title="preview"
          srcDoc={iframeContent}
          className="border-none bg-bw-white"
          style={{ 
            width: '100%', 
            minHeight: '75vh',
            height: '75vh',
            border: 'none', 
            display: 'block',
            flexShrink: 0,
            overflow: 'auto'
          }}
          sandbox="allow-scripts allow-same-origin"
          scrolling="yes"
          onLoad={() => {
            if (onLoad && iframeContent && shouldLoad && !hasLoaded) {
              setHasLoaded(true)
              notifyParentWithContent()
            }
          }}
        />
      ) : (
        <div className="relative" style={viewMode === 'custom' ? { width: `${customWidth}px`, height: `${customHeight}px`, margin: '0 auto', position: 'relative' } : {}}>
          {viewMode === 'custom' && (
            <>
              {/* Width resize handles */}
              <div 
                className="absolute top-0 bottom-0 w-4 cursor-ew-resize z-10 bg-transparent transition-colors duration-200 hover:bg-bw-gray-d/30 -left-2"
                onMouseDown={(e) => handleMouseDown(e, 'left')}
                style={{ touchAction: 'none' }}
              />
              <div 
                className="absolute top-0 bottom-0 w-4 cursor-ew-resize z-10 bg-transparent transition-colors duration-200 hover:bg-bw-gray-d/30 -right-2"
                onMouseDown={(e) => handleMouseDown(e, 'right')}
                style={{ touchAction: 'none' }}
              />
              {/* Height resize handles */}
              <div 
                className="absolute left-0 right-0 h-4 cursor-ns-resize z-10 bg-transparent transition-colors duration-200 hover:bg-bw-gray-d/30 -top-2"
                onMouseDown={(e) => handleMouseDown(e, 'top')}
                style={{ touchAction: 'none' }}
              />
              <div 
                className="absolute left-0 right-0 h-4 cursor-ns-resize z-10 bg-transparent transition-colors duration-200 hover:bg-bw-gray-d/30 -bottom-2"
                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
                style={{ touchAction: 'none' }}
              />
            </>
          )}
          <iframe
            ref={iframeRef}
            key={`iframe-${iframeKey}`}
            title="preview"
            srcDoc={iframeContent}
            className="border-none bg-bw-white"
            style={
              viewMode === 'custom'
                ? { width: `${customWidth}px`, height: `${customHeight}px`, border: '1px solid #dddddd', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
                : iframeStyle
            }
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => {
              if (onLoad && iframeContent) {
                notifyParentWithContent()
              }
            }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default HTMLExecutor
