import Select from 'react-select'
import { useRef, useState } from 'react'
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

export function SearchBar({ neighborhoods, addNeighborhood, wrapperRef }: SearchBarProps) {
    const [value, setValue] = useState<{ value: string | number; label: string } | null>(null)
    const [inputValue, setInputValue] = useState('')

    const inputRef = useRef(null);

    const baseOptions = neighborhoods.map((n) => ({
        value: n.id,
        label: n.name,
    }))

    const getSortedOptions = () => {
        const query = inputValue.toLowerCase()
        if (!query) return [...baseOptions].sort((a, b) => a.label.localeCompare(b.label))

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
    }

    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            minHeight: 52,
            borderRadius: 18,
            border: `2px solid ${COLORS.dark_blue}`, // subtle earthy accent
            boxShadow: `0 4px 12px ${COLORS.blue}`,
            cursor: 'text',
            transition: 'all 0.2s ease',
            transform: state.isFocused ? 'scale(1.02)' : 'scale(1)',
        }),

        valueContainer: (base: any) => ({ ...base, padding: '0 16px' }),

        input: (base: any) => ({
            ...base,
            margin: 0,
            padding: 0,
            fontSize: 16,
            fontWeight: 500,
        }),

        placeholder: (base: any) => ({
            ...base,
            color: COLORS.dark_blue, // subtle, readable
            fontWeight: 500,
            fontSize: 16,
        }),

        singleValue: (base: any) => ({
            ...base,
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.dark_blue,
        }),

        menu: (base: any) => ({
            ...base,
            borderRadius: 14,
            boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
            overflowY: 'auto',
        }),

        option: (base: any, state: any) => ({
            ...base,
            padding: '12px 16px',
            backgroundColor: COLORS.lifted_background,
            color: COLORS.dark_blue,
            cursor: 'pointer',
            fontWeight: state.isSelected ? 600 : 500,
        }),

        indicatorsContainer: (base: any) => ({
            ...base,
            display: 'flex',
            alignItems: 'center',
            paddingRight: 12,
        }),
    }

    const customComponents = {
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        IndicatorsContainer: ({ innerProps }: any) => (
            <div {...innerProps} style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>
                <Search size={18} color={COLORS.dark_blue} />
            </div>
        ),
    }

    const wrapper_style = {
        width: '100%',
        padding: '8px 0px',
        marginBottom: '3rem',
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',

    }


    return (
        <div style={wrapper_style}>
            <Select
                ref={inputRef}
                options={getSortedOptions()}
                value={value}
                isClearable
                placeholder="Search neighborhoods…"
                styles={selectStyles}
                inputValue={inputValue}
                onFocus={() => {
                    setTimeout(() => {
                        wrapperRef.current?.scrollTo({
                            top: wrapperRef.current.scrollHeight,
                            behavior: 'smooth',
                        });
                    }, 300);
                }}
                components={customComponents}
                onInputChange={(val) => setInputValue(val)}
                onChange={(option) => {
                    setValue(option)
                    if (option) addNeighborhood(option.value)
                }}
            />
        </div>
    )
}
