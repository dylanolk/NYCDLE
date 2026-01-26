import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { COLORS } from '../constants'

type Neighborhood = {
  id: string | number
  name: string
}

type SearchBarProps = {
  neighborhoods: Neighborhood[]
  addNeighborhood: CallableFunction
  wrapperRef: any
}

export function SearchBar({ neighborhoods, addNeighborhood }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const handler = (e: MouseEvent | TouchEvent) => {
    if (!wrapperRef.current) return
    if (!wrapperRef.current.contains(e.target as Node)) {
      setOpen(false)
      setActiveIndex(0)
    }
  }

  document.addEventListener('mousedown', handler)
  document.addEventListener('touchstart', handler)

  return () => {
    document.removeEventListener('mousedown', handler)
    document.removeEventListener('touchstart', handler)
  }
}, [])

  const baseOptions = useMemo(
    () =>
      neighborhoods.map((n) => ({
        value: n.id,
        label: n.name,
      })),
    [neighborhoods]
  )

  const sortedOptions = useMemo(() => {
    const query = inputValue.toLowerCase()

    if (!query) {
      return [...baseOptions].sort((a, b) =>
        a.label.localeCompare(b.label)
      )
    }

    return [...baseOptions]
      .filter((o) => o.label.toLowerCase().includes(query))
      .sort((a, b) => {
        const aLabel = a.label.toLowerCase()
        const bLabel = b.label.toLowerCase()

        const aStarts = aLabel.startsWith(query)
        const bStarts = bLabel.startsWith(query)
        if (aStarts !== bStarts) return aStarts ? -1 : 1

        const aWord = aLabel.split(' ').some((w) => w.startsWith(query))
        const bWord = bLabel.split(' ').some((w) => w.startsWith(query))
        if (aWord !== bWord) return aWord ? -1 : 1

        return aLabel.indexOf(query) - bLabel.indexOf(query)
      })
  }, [inputValue, baseOptions])

  const commit = (opt: any) => {
    if (!opt) return
    addNeighborhood(opt.value)
    setInputValue('')
    setOpen(false)
    setActiveIndex(0)
  }

  return (
    <div
    ref={wrapperRef}
      style={{
        width: '100%',
        padding: '8px 0',
        marginBottom: '3rem',
        position: 'relative',
        fontFamily:
          '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 52,
          borderRadius: 18,
          border: `2px solid ${COLORS.dark_blue}`,
          boxShadow: `0 4px 12px ${COLORS.blue}`,
          padding: '0 16px',
          background: 'white',
        }}
      >
        <Search size={18} color={COLORS.dark_blue} />
        <input
          value={inputValue}
          placeholder="Search neighborhoods…"
          onFocus={() => {
            setInputValue('')      // clear on click
            setOpen(true)
          }}
          onChange={(e) => {
            setInputValue(e.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onKeyDown={(e) => {
            if (!open) return

            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) =>
                Math.min(i + 1, sortedOptions.length - 1)
              )
            }

            if (e.key === 'AxrrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            }

            if (e.key === 'Enter') {
              e.preventDefault()
              commit(sortedOptions[activeIndex])
            }

            if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            marginLeft: 8,
            fontSize: 16,
            fontWeight: 500,
            color: COLORS.dark_blue,
            background: 'transparent',
          }}
        />
      </div>

      {/* Dropdown */}
      {open && sortedOptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            background: COLORS.lifted_background,
            borderRadius: 16,
            boxShadow: '0 18px 36px rgba(0,0,0,0.14)',
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 10,
            padding: '6px 0',
          }}
        >
          {sortedOptions.map((o, i) => {
            const active = i === activeIndex
            return (
              <div
                key={o.value}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()} // prevent input blur
                onClick={() => commit(o)}
                style={{
                  padding: '12px 18px',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 500,
                  color: COLORS.dark_blue,
                  background: active
                    ? 'rgba(0,0,0,0.06)'
                    : 'transparent',
                  borderRadius: 10,
                  margin: '2px 6px',
                  transition: 'all 0.12s ease',
                }}
              >
                {o.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
