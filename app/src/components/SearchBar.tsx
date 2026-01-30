import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { COLORS } from '../constants'
import fuzzysort from 'fuzzysort'

function scoreSegment(segment: string, tokens: string[]) {
  let score = 0
  let matchedTokens = 0

  const lowerSegment = segment.toLowerCase()

  for (const token of tokens) {
    const res = fuzzysort.single(token, lowerSegment)
    if (!res) continue

    matchedTokens++

    score += res.score

    // Word boundary boost
    const firstIdx = res.indexes[0]
    if (
      firstIdx === 0 ||
      lowerSegment[firstIdx - 1] === ' ' ||
      lowerSegment[firstIdx - 1] === '-' ||
      lowerSegment[firstIdx - 1] === '_'
    ) {
      score += 100
    }

    // Extra: **prefix match boost** (very strong)
    if (lowerSegment.startsWith(token)) {
      score += 500 // tweak as needed
    }

    // Extra: longer consecutive runs
    let run = 1
    for (let i = 1; i < res.indexes.length; i++) {
      if (res.indexes[i] === res.indexes[i - 1] + 1) run++
    }
    score += run * 10
  }

  // Penalize extra words
  const extraWords = segment.split(/\s+/).length - matchedTokens
  score -= extraWords * 20

  // Extra: make exact full token match bubble to top
  if (matchedTokens === tokens.length) score += 1000

  return score
}


function splitHyphen(label: string) {
  return label.split('-').map(s => s.trim())
}

function tokenizedHyphenFuzzy(label: string, query: string) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const segments = splitHyphen(label.toLowerCase())

  let bestScore = -Infinity
  let bestSegmentIndex = 0

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i]
    const score = scoreSegment(s, tokens)

    // Prefer higher score; tie-break: earlier segment wins
    if (score > bestScore) {
      bestScore = score
      bestSegmentIndex = i
    }
  }

  return {
    score: bestScore,
    segmentIndex: bestSegmentIndex,
    length: label.length,
  }
}



type Neighborhood = {
  id: string | number
  name: string
}

type SearchBarProps = {
  neighborhoods: Neighborhood[]
  addNeighborhood: CallableFunction
  wrapperRef: any
  practice: boolean
}

export function SearchBar({ neighborhoods, addNeighborhood, practice = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInput =
        tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable

      if (!isInput) {
        // Focus the search input
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    let startX = 0
    let startY = 0
    let moved = false

    const onPointerDown = (e: PointerEvent) => {
      // Only care about primary button / finger
      if (e.button !== 0) return

      startX = e.clientX
      startY = e.clientY
      moved = false
    }

    const onPointerMove = (e: PointerEvent) => {
      const dx = Math.abs(e.clientX - startX)
      const dy = Math.abs(e.clientY - startY)

      // If finger moves more than a few pixels → it's a scroll
      if (dx > 8 || dy > 8) {
        moved = true
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (moved) return // was a scroll, ignore

      if (!wrapperRef.current) return

      // A real tap outside → close
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(0)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
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
    const query = inputValue.trim().toLowerCase()
    if (!query) return [...baseOptions].sort((a, b) => a.label.localeCompare(b.label))

    return baseOptions
      .map(o => {
        const meta = tokenizedHyphenFuzzy(o.label, query)
        return meta ? { ...o, _meta: meta } : null
      })
      .filter(Boolean)
      .sort((a, b) => {
        // 1️⃣ Higher score wins
        if (b!._meta.score !== a!._meta.score)
          return b!._meta.score - a!._meta.score

        // 2️⃣ Earlier hyphen segment wins
        if (a!._meta.segmentIndex !== b!._meta.segmentIndex)
          return a!._meta.segmentIndex - b!._meta.segmentIndex

        // 3️⃣ Shorter overall label wins (penalize superfluous words)
        if (a!.label.length !== b!.label.length)
          return a!.label.length - b!.label.length

        // 4️⃣ Alphabetical fallback
        return a!.label.localeCompare(b!.label)
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
          boxShadow: `0 4px 12px ${practice ? COLORS.deep_red : COLORS.blue}`,
          padding: '0 16px',
          background: 'white',
        }}
      >
        <Search size={18} color={COLORS.dark_blue} />
        <input
          ref={inputRef}
          value={inputValue}
          placeholder="Search neighborhoods…"
          onFocus={() => {
            setInputValue('')
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

            if (e.key === 'ArrowUp') {
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
            padding: '6px 0',
          }}
        >
          {sortedOptions.map((o, i) => {
            const active = i === activeIndex
            return (
              <div
                key={o.value}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
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
