import Select from 'react-select';
import { useState, useContext } from 'react';
import { NeighborhoodsContext } from '../contexts/NeighborhoodsContext';

type Neighborhood = {
    id: string | number;
    name: string;
};

type SearchBarProps = {
    neighborhoods: Neighborhood[];
};

export function SearchBar({ neighborhoods }: SearchBarProps) {
    const options = neighborhoods.map(n => ({ value: n.id, label: n.name }));
    const [value, setValue] = useState<{ value: string | number; label: string } | null>(null);
    const context = useContext(NeighborhoodsContext)

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

    return (
        <div style={styles.box}>
            <Select
                options={options}
                isClearable
                value={value}
                placeholder="Search"
                components={{ DropdownIndicator: () => null }}
                styles={styles.select}
                onChange={(option) => {
                    context.current[option.value].setEnabled(true);
                }}
            />
        </div>
    );
}
