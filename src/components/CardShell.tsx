import { useEffect, useRef, useState } from 'react'

export default function CardShell({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      if (wrapperRef.current) {
        const parentW = wrapperRef.current.parentElement?.clientWidth || 400
        setScale(Math.min(1, parentW / 400))
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div ref={wrapperRef} className="w-full flex justify-center lg:justify-start">
      <div
        className="bg-white shadow-none origin-top"
        style={{ width: 400, minHeight: '24.8rem', height: 588, transform: `scale(${scale})`, fontFamily: "'IBM Plex Sans', Arial, Helvetica, FreeSans, sans-serif" }}
      >
        <div className="flex flex-col h-full px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
