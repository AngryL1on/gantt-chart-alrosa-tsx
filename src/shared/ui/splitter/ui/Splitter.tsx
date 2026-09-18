import { useEffect, useRef } from 'react'

type Props = {
  onResize: (leftWidth: number) => void
}

export function Splitter({ onResize }: Props) {
  const active = useRef(false)
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!active.current) return
      onResize(Math.max(280, Math.min(window.innerWidth - 240, ev.clientX)))
    }
    const onUp = () => {
      active.current = false
      elRef.current?.classList.remove('active')
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onResize])

  return (
    <div
      ref={elRef}
      className="splitter"
      title="Ширина таблицы"
      onMouseDown={(e) => {
        e.preventDefault()
        active.current = true
        elRef.current?.classList.add('active')
      }}
    />
  )
}
