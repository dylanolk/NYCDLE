import Select from 'react-select';
import { useState } from 'react';

type Neighborhood = {
    id: string | number;
    name: string;
};

type SearchBarProps = {
    neighborhoods: Neighborhood[];
    onSubmit: CallableFunction;
};

export function SearchBar({ neighborhoods, onSubmit }: SearchBarProps) {
    const options = neighborhoods.map(n => ({ value: n.id, label: n.name }));
    const [value, setValue] = useState<{ value: string | number; label: string } | null>(null);

    const styles = {
        select: {
            control: (base: any) => ({
                ...base,
                width: '100%',
                minHeight: 50,
                paddingTop: 4,
                paddingBottom: 4,
                cursor: 'text',
            }),
            valueContainer: (base: any) => ({
                ...base,
                paddingTop: 0,
                paddingBottom: 0,
            }),
        },
        box: {
            width: '40vw',
            height: '20vh',
            margin: "2vh"
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit(value?.value ?? null);
            setValue(null); // Optional: clear after submit
        }
    };
    return (
        <div onKeyDown={handleKeyDown} style={styles.box}>
            <Select
                options={options}
                isClearable
                value={value}
                placeholder="Search"
                components={{ DropdownIndicator: () => null }}
                styles={styles.select}
                onChange={(option) => {
                    setValue(option)
                }}
            />
        </div>
    );
}
