import ElementNode from './ElementNode'
import useCanvas from '../hooks/useCanvas'
import type { Element } from '../types/types'

interface CanvasProps {
  elements: Element[]
  setElements: React.Dispatch<React.SetStateAction<Element[]>>
  selectedId: number | null
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>
}

export default function Canvas({
  elements,
  setElements,
  selectedId,
  setSelectedId,
}: CanvasProps) {
  const { canvasRef, hoveredId, draggingRef } = useCanvas({
    elements,
    setElements,
    selectedId,
    setSelectedId,
  })

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-screen bg-gray-200 overflow-hidden"
    >
      {elements.map((el) => (
        <ElementNode
          key={el.id}
          element={el}
          selected={el.id === selectedId}
          dragging={draggingRef.current && el.id === selectedId}
          hovered={el.id === hoveredId}
        />
      ))}
    </div>
  )
}
