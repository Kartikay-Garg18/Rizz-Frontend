import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from "../../utils/utils"

export function GridMotion({
  items = [],
  className
}) {
  const gridRef = useRef([])
  const rowRefs = useRef([])
  const mouseXRef = useRef(window.innerWidth / 2)

  const totalItems = 20
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`)
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems

  useEffect(() => {
    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e) => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = () => {
      const maxMoveAmount = 300
      const baseDuration = 0.8
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 4) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
    }
  }, [])

  return (
    <div className={cn("h-full w-full overflow-hidden", className)} ref={gridRef}>
      <section
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
      >
        <div className="relative z-2 flex-none grid h-[130vh] w-[130vw] gap-4 grid-rows-[repeat(4,1fr)] grid-cols-[100%] -rotate-15 origin-center">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-[repeat(7,1fr)] will-change-transform will-change-filter"
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 2 + itemIndex]
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center text-foreground text-xl">
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${content})`,
                          }}
                        />
                      ) : (
                        <div className="p-4 text-center z-1">
                          {content}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="relative pointer-events-none h-full w-full inset-0">
          <div className="rounded-none" />
        </div>
      </section>
    </div>
  )
}