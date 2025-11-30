import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, RotateCcw } from 'react-feather'
import { useI18n } from '../i18n/I18nContext'

const DEFAULT_CUSTOM_LAYOUT = [
  { id: 'input', name: 'Input', row: 0, col: 0, rowspan: 1, colspan: 4 },
  { id: 'output', name: 'Output', row: 1, col: 0, rowspan: 1, colspan: 4 },
  { id: 'preview', name: 'Preview', row: 2, col: 0, rowspan: 1, colspan: 4 }
]

const GRID_COLS = 4
const GRID_ROWS = 3

export default function CustomLayoutEditor({ isOpen, onClose, onSave, currentLayout }) {
  const { t } = useI18n()
  const [grid, setGrid] = useState(() => {
    // Initialize grid with items
    const initialGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
    DEFAULT_CUSTOM_LAYOUT.forEach(item => {
      if (initialGrid[item.row] && initialGrid[item.row][item.col] === null) {
        initialGrid[item.row][item.col] = item
      }
    })
    return initialGrid
  })
  const [draggedItem, setDraggedItem] = useState(null)
  const [draggedOverCell, setDraggedOverCell] = useState(null)
  const [resizingItem, setResizingItem] = useState(null)
  const [resizeDirection, setResizeDirection] = useState(null)
  const [resizeStartPos, setResizeStartPos] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Load saved layout from localStorage
      const saved = localStorage.getItem('custom-layout-order')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length === 3) {
            // Check if it's old format (with order) or new format (with row/col)
            if (parsed[0].row !== undefined && parsed[0].col !== undefined) {
              // New format with grid
              const newGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
              parsed.forEach(item => {
                if (item.row < GRID_ROWS && item.col < GRID_COLS) {
                  const itemWithDefaults = {
                    ...item,
                    rowspan: item.rowspan || 1,
                    colspan: item.colspan || 1
                  }
                  newGrid[item.row][item.col] = itemWithDefaults
                }
              })
              setGrid(newGrid)
            } else {
              // Old format - convert to grid (vertical stack)
              const newGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
              parsed.forEach((item, index) => {
                newGrid[index][0] = { ...item, row: index, col: 0, rowspan: 1, colspan: 1 }
              })
              setGrid(newGrid)
            }
          }
        } catch (e) {
          // Use default if parse fails
          initializeDefaultGrid()
        }
      } else {
        initializeDefaultGrid()
      }
    }
  }, [isOpen])

  const initializeDefaultGrid = () => {
    const newGrid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null))
    DEFAULT_CUSTOM_LAYOUT.forEach(item => {
      newGrid[item.row][item.col] = item
    })
    setGrid(newGrid)
  }

  const handleDragStart = (e, item) => {
    if (resizingItem) return // Don't drag while resizing
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', item.id)
  }

  const handleDragOver = (e, row, col) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverCell({ row, col })
  }

  const handleDragLeave = () => {
    setDraggedOverCell(null)
  }

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault()
    if (!draggedItem) {
      setDraggedItem(null)
      setDraggedOverCell(null)
      return
    }

    const newGrid = grid.map(row => [...row])
    
    // Find and remove dragged item from current position (including spanned cells)
    let draggedItemInfo = null
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (newGrid[r][c]?.id === draggedItem.id) {
          // Save item info before clearing
          if (!draggedItemInfo) {
            draggedItemInfo = newGrid[r][c]
          }
          // Clear all cells occupied by this item
          const itemRowspan = draggedItemInfo.rowspan || 1
          const itemColspan = draggedItemInfo.colspan || 1
          for (let dr = 0; dr < itemRowspan; dr++) {
            for (let dc = 0; dc < itemColspan; dc++) {
              if (r + dr < GRID_ROWS && c + dc < GRID_COLS) {
                newGrid[r + dr][c + dc] = null
              }
            }
          }
          break // Found the item, no need to continue
        }
      }
      if (draggedItemInfo) break
    }
    
    // Use saved item info or fallback to draggedItem
    const itemToPlace = draggedItemInfo || draggedItem
    const itemRowspan = itemToPlace.rowspan || 1
    const itemColspan = itemToPlace.colspan || 1

    // Check if there's enough space for the item at target position
    let canPlace = true
    let targetItem = null
    
    // Check if target area is available (excluding the item being moved)
    for (let dr = 0; dr < itemRowspan; dr++) {
      for (let dc = 0; dc < itemColspan; dc++) {
        const checkRow = targetRow + dr
        const checkCol = targetCol + dc
        if (checkRow >= GRID_ROWS || checkCol >= GRID_COLS) {
          canPlace = false
          break
        }
        const cellItem = newGrid[checkRow][checkCol]
        if (cellItem && cellItem.id !== itemToPlace.id) {
          // If there's another item, check if we can swap
          if (!targetItem) {
            targetItem = cellItem
          } else if (targetItem.id !== cellItem.id) {
            // Multiple different items in the area, can't place
            canPlace = false
            break
          }
        }
      }
      if (!canPlace) break
    }

    if (!canPlace) {
      // Not enough space, restore the item to original position
      setDraggedItem(null)
      setDraggedOverCell(null)
      return
    }

    // Check if target cell is occupied by a different item (swap scenario)
    if (targetItem && targetItem.id !== itemToPlace.id) {
      // Swap items - check if source has enough space for target item
      const sourceRow = itemToPlace.row
      const sourceCol = itemToPlace.col
      const sourceRowspan = itemToPlace.rowspan || 1
      const sourceColspan = itemToPlace.colspan || 1
      const targetRowspan = targetItem.rowspan || 1
      const targetColspan = targetItem.colspan || 1
      
      // Check if source area has enough space for target item
      let canSwap = true
      for (let dr = 0; dr < targetRowspan; dr++) {
        for (let dc = 0; dc < targetColspan; dc++) {
          const checkRow = sourceRow + dr
          const checkCol = sourceCol + dc
          if (checkRow >= GRID_ROWS || checkCol >= GRID_COLS) {
            canSwap = false
            break
          }
          const cellItem = newGrid[checkRow][checkCol]
          if (cellItem && cellItem.id !== itemToPlace.id && cellItem.id !== targetItem.id) {
            canSwap = false
            break
          }
        }
        if (!canSwap) break
      }
      
      if (!canSwap) {
        // Can't swap, restore
        setDraggedItem(null)
        setDraggedOverCell(null)
        return
      }
      
      // Clear source
      for (let dr = 0; dr < sourceRowspan; dr++) {
        for (let dc = 0; dc < sourceColspan; dc++) {
          if (sourceRow + dr < GRID_ROWS && sourceCol + dc < GRID_COLS) {
            newGrid[sourceRow + dr][sourceCol + dc] = null
          }
        }
      }
      
      // Clear target area
      for (let dr = 0; dr < targetRowspan; dr++) {
        for (let dc = 0; dc < targetColspan; dc++) {
          if (targetRow + dr < GRID_ROWS && targetCol + dc < GRID_COLS) {
            newGrid[targetRow + dr][targetCol + dc] = null
          }
        }
      }
      
      // Place dragged item at target with original size
      newGrid[targetRow][targetCol] = { 
        ...itemToPlace, 
        row: targetRow, 
        col: targetCol,
        rowspan: itemRowspan,
        colspan: itemColspan
      }
      
      // Place target item at source with original size
      newGrid[sourceRow][sourceCol] = { 
        ...targetItem, 
        row: sourceRow, 
        col: sourceCol,
        rowspan: targetRowspan,
        colspan: targetColspan
      }
    } else {
      // Place in empty cell with original size
      newGrid[targetRow][targetCol] = { 
        ...itemToPlace, 
        row: targetRow, 
        col: targetCol,
        rowspan: itemRowspan,
        colspan: itemColspan
      }
    }

    setGrid(newGrid)
    setDraggedItem(null)
    setDraggedOverCell(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedOverCell(null)
  }

  const handleResizeStart = (e, item, direction) => {
    e.stopPropagation()
    e.preventDefault()
    setResizingItem(item)
    setResizeDirection(direction)
    setResizeStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleResizeMove = (e) => {
    if (!resizingItem || !resizeStartPos) return

    const deltaX = e.clientX - resizeStartPos.x
    const deltaY = e.clientY - resizeStartPos.y
    const cellSize = 120 // Approximate cell size in pixels (including gap)
    const deltaCols = Math.round(deltaX / cellSize)
    const deltaRows = Math.round(deltaY / cellSize)

    const newGrid = grid.map(row => [...row])
    const item = newGrid[resizingItem.row][resizingItem.col]
    if (!item) return

    let newRowspan = item.rowspan || 1
    let newColspan = item.colspan || 1

    if (resizeDirection.includes('bottom')) {
      // Resize from bottom: increase/decrease rowspan
      newRowspan = Math.max(1, Math.min(GRID_ROWS - item.row, (item.rowspan || 1) + deltaRows))
    }
    if (resizeDirection.includes('top')) {
      // Resize from top: can move up or decrease rowspan
      if (deltaRows < 0) {
        // Shrinking from top - decrease rowspan, keep bottom edge fixed
        newRowspan = Math.max(1, (item.rowspan || 1) + deltaRows)
      } else if (deltaRows > 0) {
        // Expanding from top - move up and increase rowspan
        const newRow = Math.max(0, item.row - deltaRows)
        const newRowspan2 = Math.max(1, Math.min(GRID_ROWS - newRow, (item.rowspan || 1) + deltaRows))
        if (newRow !== item.row) {
          // Move item up
          for (let r = 0; r < (item.rowspan || 1); r++) {
            for (let c = 0; c < (item.colspan || 1); c++) {
              if (item.row + r < GRID_ROWS && item.col + c < GRID_COLS) {
                newGrid[item.row + r][item.col + c] = null
              }
            }
          }
          newGrid[newRow][item.col] = { ...item, row: newRow, rowspan: newRowspan2 }
          setGrid(newGrid)
          setResizingItem({ ...item, row: newRow, rowspan: newRowspan2 })
          return
        }
        newRowspan = newRowspan2
      }
    }
    if (resizeDirection.includes('right')) {
      // Resize from right: increase/decrease colspan
      newColspan = Math.max(1, Math.min(GRID_COLS - item.col, (item.colspan || 1) + deltaCols))
    }
    if (resizeDirection.includes('left')) {
      // Resize from left: can move left or decrease colspan
      if (deltaCols < 0) {
        // Shrinking from left - decrease colspan
        // If col = 0, move item right and decrease colspan to keep right edge fixed
        const shrinkAmount = Math.min((item.colspan || 1) - 1, -deltaCols)
        newColspan = Math.max(1, (item.colspan || 1) + deltaCols)
        if (item.col === 0 && newColspan < (item.colspan || 1)) {
          // Move item right when shrinking from left edge
          const newCol = Math.min(GRID_COLS - newColspan, shrinkAmount)
          if (newCol > 0) {
            // Clear old cells
            for (let r = 0; r < (item.rowspan || 1); r++) {
              for (let c = 0; c < (item.colspan || 1); c++) {
                if (item.row + r < GRID_ROWS && item.col + c < GRID_COLS) {
                  newGrid[item.row + r][item.col + c] = null
                }
              }
            }
            newGrid[item.row][newCol] = { ...item, col: newCol, colspan: newColspan }
            setGrid(newGrid)
            setResizingItem({ ...item, col: newCol, colspan: newColspan })
            return
          }
        }
      } else if (deltaCols > 0) {
        // Expanding from left - move left and increase colspan
        const newCol = Math.max(0, item.col - deltaCols)
        const newColspan2 = Math.max(1, Math.min(GRID_COLS - newCol, (item.colspan || 1) + deltaCols))
        if (newCol !== item.col) {
          // Move item left
          for (let r = 0; r < (item.rowspan || 1); r++) {
            for (let c = 0; c < (item.colspan || 1); c++) {
              if (item.row + r < GRID_ROWS && item.col + c < GRID_COLS) {
                newGrid[item.row + r][item.col + c] = null
              }
            }
          }
          newGrid[item.row][newCol] = { ...item, col: newCol, colspan: newColspan2 }
          setGrid(newGrid)
          setResizingItem({ ...item, col: newCol, colspan: newColspan2 })
          return
        }
        newColspan = newColspan2
      }
    }

    // Check if new size conflicts with other items
    let canResize = true
    for (let r = item.row; r < item.row + newRowspan; r++) {
      for (let c = item.col; c < item.col + newColspan; c++) {
        if (r >= GRID_ROWS || c >= GRID_COLS) {
          canResize = false
          break
        }
        if (newGrid[r][c] && newGrid[r][c].id !== item.id) {
          canResize = false
          break
        }
      }
      if (!canResize) break
    }

    if (canResize) {
      // Clear old cells
      for (let r = item.row; r < item.row + (item.rowspan || 1); r++) {
        for (let c = item.col; c < item.col + (item.colspan || 1); c++) {
          if (r < GRID_ROWS && c < GRID_COLS) {
            newGrid[r][c] = null
          }
        }
      }
      // Place with new size
      newGrid[item.row][item.col] = { ...item, rowspan: newRowspan, colspan: newColspan }
      setGrid(newGrid)
      setResizingItem({ ...item, rowspan: newRowspan, colspan: newColspan })
    }
  }

  const handleResizeEnd = () => {
    setResizingItem(null)
    setResizeDirection(null)
    setResizeStartPos(null)
  }

  useEffect(() => {
    if (resizingItem) {
      const handleMouseMove = (e) => handleResizeMove(e)
      const handleMouseUp = () => handleResizeEnd()
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [resizingItem, resizeStartPos, resizeDirection])

  const handleReset = () => {
    initializeDefaultGrid()
  }

  const handleSave = () => {
    // Convert grid to flat array, preserving order (top to bottom, left to right)
    const items = []
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c]) {
          items.push(grid[r][c])
        }
      }
    }
    
    // Ensure we have all 3 items
    if (items.length === 3) {
      localStorage.setItem('custom-layout-order', JSON.stringify(items))
      onSave(items)
      onClose()
    }
  }

  const getItemColor = (id) => {
    switch (id) {
      case 'input':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
      case 'output':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
      case 'preview':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
    }
  }

  const isCellOccupied = (row, col, item) => {
    if (!item) return false
    return row >= item.row && row < item.row + (item.rowspan || 1) &&
           col >= item.col && col < item.col + (item.colspan || 1)
  }

  const getItemAtCell = (row, col) => {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const item = grid[r][c]
        if (item && isCellOccupied(row, col, item)) {
          return item
        }
      }
    }
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={containerRef}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-bw-white dark:bg-bw-gray-2 border border-bw-gray-d dark:border-bw-gray-3 rounded-sm shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-bw-gray-d dark:border-bw-gray-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-bw-black dark:text-bw-white">
                  {t('header.layout.customEditor.title')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-bw-gray-f dark:hover:bg-bw-gray-3 rounded-sm transition-colors"
                >
                  <X size={20} className="text-bw-gray-7 dark:text-bw-gray-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-sm text-bw-gray-7 dark:text-bw-gray-6 mb-6">
                  {t('header.layout.customEditor.description')}
                </p>

                {/* Grid Layout Preview */}
                <div className="grid grid-cols-4 gap-3">
                  {Array(GRID_ROWS).fill(null).map((_, row) => 
                    Array(GRID_COLS).fill(null).map((_, col) => {
                      const item = getItemAtCell(row, col)
                      const isItemStart = item && item.row === row && item.col === col
                      const isDraggedOver = draggedOverCell?.row === row && draggedOverCell?.col === col
                      const isDragging = draggedItem?.id === item?.id
                      const rowspan = item?.rowspan || 1
                      const colspan = item?.colspan || 1

                      return (
                        <div
                          key={`${row}-${col}`}
                          onDragOver={(e) => handleDragOver(e, row, col)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, row, col)}
                          className={`
                            min-h-[100px] rounded-sm border-2 transition-all relative
                            ${item && isItemStart
                              ? `${getItemColor(item.id)} cursor-move` 
                              : item
                              ? 'border-transparent'
                              : 'border-dashed border-bw-gray-d dark:border-bw-gray-3 bg-bw-gray-f dark:bg-bw-gray-3'
                            }
                            ${isDraggedOver ? 'ring-2 ring-bw-black dark:ring-bw-white ring-offset-2' : ''}
                            ${isDragging ? 'opacity-50' : ''}
                          `}
                          style={item && isItemStart ? {
                            gridRow: `span ${rowspan}`,
                            gridColumn: `span ${colspan}`
                          } : item ? {
                            display: 'none'
                          } : {}}
                        >
                          {item && isItemStart ? (
                            <motion.div
                              draggable
                              onDragStart={(e) => handleDragStart(e, item)}
                              onDragEnd={handleDragEnd}
                              className="h-full p-3 flex flex-col items-center justify-center gap-2 relative"
                              whileHover={{ scale: 1.02 }}
                              whileDrag={{ scale: 1.05, zIndex: 10 }}
                            >
                              <div className="w-6 h-6 rounded-sm bg-bw-white dark:bg-bw-gray-3 flex items-center justify-center text-xs font-bold text-bw-black dark:text-bw-white">
                                {row * GRID_COLS + col + 1}
                              </div>
                              <span className="text-xs font-semibold text-bw-black dark:text-bw-white text-center">
                                {t(`header.layout.customEditor.${item.id}`)}
                              </span>
                              {(rowspan > 1 || colspan > 1) && (
                                <span className="text-xs text-bw-gray-6 dark:text-bw-gray-5">
                                  {rowspan}×{colspan}
                                </span>
                              )}
                              
                              {/* Resize handles */}
                              {/* Top */}
                              {row > 0 && (
                                <div
                                  className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-bw-black/10 dark:hover:bg-bw-white/10"
                                  onMouseDown={(e) => handleResizeStart(e, item, 'top')}
                                />
                              )}
                              {/* Bottom */}
                              {row + rowspan < GRID_ROWS && (
                                <div
                                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-bw-black/10 dark:hover:bg-bw-white/10"
                                  onMouseDown={(e) => handleResizeStart(e, item, 'bottom')}
                                />
                              )}
                              {/* Left - always show, can shrink even when col = 0 */}
                              <div
                                className="absolute top-0 bottom-0 left-0 w-2 cursor-ew-resize hover:bg-bw-black/10 dark:hover:bg-bw-white/10"
                                onMouseDown={(e) => handleResizeStart(e, item, 'left')}
                              />
                              {/* Right - always show, can shrink even when full width */}
                              <div
                                className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize hover:bg-bw-black/10 dark:hover:bg-bw-white/10"
                                onMouseDown={(e) => handleResizeStart(e, item, 'right')}
                              />
                              {/* Corners */}
                              {row > 0 && col > 0 && (
                                <div
                                  className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize hover:bg-bw-black/20 dark:hover:bg-bw-white/20"
                                  onMouseDown={(e) => handleResizeStart(e, item, 'top-left')}
                                />
                              )}
                              {row > 0 && col + colspan < GRID_COLS && (
                                <div
                                  className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize hover:bg-bw-black/20 dark:hover:bg-bw-white/20"
                                  onMouseDown={(e) => handleResizeStart(e, item, 'top-right')}
                                />
                              )}
                              {row + rowspan < GRID_ROWS && col > 0 && (
                                <div
                                  className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize hover:bg-bw-black/20 dark:hover:bg-bw-white/20"
                                  onMouseDown={(e) => handleResizeStart(e, item, 'bottom-left')}
                                />
                              )}
                              {row + rowspan < GRID_ROWS && col + colspan < GRID_COLS && (
                                <div
                                  className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize hover:bg-bw-black/20 dark:hover:bg-bw-white/20"
                                  onMouseDown={(e) => handleResizeStart(e, item, 'bottom-right')}
                                />
                              )}
                            </motion.div>
                          ) : item ? null : (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-xs text-bw-gray-6 dark:text-bw-gray-5">
                                {t('header.layout.customEditor.empty')}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-bw-gray-d dark:border-bw-gray-3 flex items-center justify-end gap-3">
                <motion.button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-bw-white dark:bg-bw-gray-3 text-bw-black dark:text-bw-white border border-bw-gray-d dark:border-bw-gray-3 rounded-sm text-sm font-medium hover:bg-bw-gray-f dark:hover:bg-bw-gray-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw size={16} strokeWidth={2} />
                  {t('header.layout.customEditor.reset')}
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-bw-black dark:bg-bw-gray-1 text-bw-white rounded-sm text-sm font-medium hover:bg-bw-gray-7 dark:hover:bg-bw-gray-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={16} strokeWidth={2} />
                  {t('header.layout.customEditor.save')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
