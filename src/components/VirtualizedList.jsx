import { useMemo, useRef, useEffect, useState, useCallback } from 'react'

const ITEM_HEIGHT = 60
const BUFFER_SIZE = 2
const SCROLL_DEBOUNCE_MS = 16

export default function VirtualizedList({ 
  items = [], 
  renderItem, 
  className = '',
  emptyMessage = 'No items',
  maxHeight = 260
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollContainerRef = useRef(null)
  const scrollTimeoutRef = useRef(null)
  const totalHeight = items.length * ITEM_HEIGHT

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + maxHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    )
    return { start, end }
  }, [scrollTop, items.length, maxHeight])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange.start, visibleRange.end])

  const handleScroll = useCallback((e) => {
    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop)
    })
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        container.removeEventListener('scroll', handleScroll)
        if (scrollTimeoutRef.current) {
          cancelAnimationFrame(scrollTimeoutRef.current)
        }
      }
    }
  }, [handleScroll])

  if (items.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center p-4`}>
        <p className="text-xs text-bw-gray-7 dark:text-bw-gray-6">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className={`${className} overflow-auto`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: `${visibleRange.start * ITEM_HEIGHT}px`,
            width: '100%'
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={item.id || index}
              style={{ height: `${ITEM_HEIGHT}px` }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

