import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Canvas from '../components/Canvas'
import type { Element } from '../types/types'

export const Route = createFileRoute('/')({
  component: App,
})

export default function App() {
  const [elements, setElements] = useState<Element[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <Canvas
      elements={elements}
      setElements={setElements}
      selectedId={selectedId}
      setSelectedId={setSelectedId}
    />
  )
}
