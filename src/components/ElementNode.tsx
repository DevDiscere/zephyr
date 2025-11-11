import type { Element } from '../types/types'

interface Props {
  element: Element
  selected: boolean
  dragging: boolean
  hovered: boolean
}

export default function ElementNode({
  element,
  selected,
  dragging,
  hovered,
}: Props) {
  let outline = '2px solid gray'
  if (element.drawing) outline = '2px dashed gray'
  else if (dragging) outline = '2px solid blue'
  else if (selected) outline = '2px solid orange'

  return (
    <div
      data-id={element.id}
      className="absolute pointer-events-auto"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        outline,
        background: 'rgba(114,114,114,0.3)',
        cursor: dragging || selected || hovered ? 'move' : 'default',
      }}
    />
  )
}
