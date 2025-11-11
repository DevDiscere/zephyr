import { useEffect, useRef, useState } from 'react'
import type { Element } from '../types/types'

interface UseCanvasProps {
  elements: Element[]
  setElements: React.Dispatch<React.SetStateAction<Element[]>>
  selectedId: number | null
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>
}

export default function useCanvas({
  elements,
  setElements,
  selectedId,
  setSelectedId,
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const draggingRef = useRef(false)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const nextIdRef = useRef(0)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const dragThreshold = 3 // pixels

  const getRelativePos = (e: PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.style.touchAction = 'none'

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return // only handle left-click

      e.preventDefault()
      const target = e.target as HTMLElement

      // Click on existing element → select
      if (target !== canvas && target.dataset.id) {
        const id = Number(target.dataset.id)
        setSelectedId(id)

        // Prepare for dragging after movement threshold
        const el = elements.find((el) => el.id === id)!
        const relPos = getRelativePos(e)
        dragOffsetRef.current = { x: relPos.x - el.x, y: relPos.y - el.y }
        dragStartPosRef.current = relPos
        draggingRef.current = false // do not drag yet
        return
      }

      // Click on empty space → deselect
      setSelectedId(null)

      // Start drawing new element
      drawingRef.current = true
      const { x, y } = getRelativePos(e)
      startRef.current = { x, y }

      const id = nextIdRef.current++
      setElements((prev) => [
        ...prev,
        { id, x, y, width: 0, height: 0, drawing: true },
      ])
    }

    const handlePointerMove = (e: PointerEvent) => {
      const relPos = getRelativePos(e)

      // Hover detection
      if (!draggingRef.current && !drawingRef.current) {
        const target = e.target as HTMLElement
        if (target.dataset.id) {
          setHoveredId(Number(target.dataset.id))
          canvas.style.cursor = 'move'
        } else {
          setHoveredId(null)
          canvas.style.cursor = 'default'
        }
      }

      // Dragging logic
      if (
        !drawingRef.current &&
        selectedId !== null &&
        dragStartPosRef.current
      ) {
        const dx = relPos.x - dragStartPosRef.current.x
        const dy = relPos.y - dragStartPosRef.current.y

        // Start dragging only after movement threshold
        if (
          !draggingRef.current &&
          Math.sqrt(dx * dx + dy * dy) > dragThreshold
        ) {
          draggingRef.current = true
        }

        if (draggingRef.current) {
          setElements((prev) =>
            prev.map((el) =>
              el.id === selectedId
                ? {
                    ...el,
                    x: relPos.x - dragOffsetRef.current.x,
                    y: relPos.y - dragOffsetRef.current.y,
                    drawing: false,
                  }
                : el,
            ),
          )
          return
        }
      }

      // Drawing new element
      if (drawingRef.current && startRef.current) {
        const { x: startX, y: startY } = startRef.current
        let width = relPos.x - startX
        let height = relPos.y - startY

        if (e.shiftKey) {
          const size = Math.max(Math.abs(width), Math.abs(height))
          width = width < 0 ? -size : size
          height = height < 0 ? -size : size
        }

        setElements((prev) => {
          const newElements = [...prev]
          const last = newElements[newElements.length - 1]
          last.width = Math.abs(width)
          last.height = Math.abs(height)
          last.x = width < 0 ? startX + width : startX
          last.y = height < 0 ? startY + height : startY
          return newElements
        })
      }
    }

    const handlePointerUp = () => {
      drawingRef.current = false
      startRef.current = null
      draggingRef.current = false
      dragStartPosRef.current = null
      canvas.style.cursor = hoveredId ? 'move' : 'default'

      // Assign default size for click-only elements
      setElements((prev) => {
        const newElements = [...prev]
        const last = newElements[newElements.length - 1]
        if (last && last.drawing) {
          if (last.width === 0 || last.height === 0) {
            last.width = 50
            last.height = 50
            last.x -= 25
            last.y -= 25
          }
          last.drawing = false
        }
        return newElements
      })
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        selectedId !== null &&
        (e.key === 'Delete' || e.key === 'Backspace')
      ) {
        setElements((prev) => prev.filter((el) => el.id !== selectedId))
        setSelectedId(null)
      }
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedId, hoveredId, elements, setElements, setSelectedId])

  return { canvasRef, hoveredId, draggingRef }
}
