import Select from 'react-select';

type SearchBarProps = {
    neighborhoods: [];
};

export function SearchBar({ neighborhoods }: SearchBarProps) {
    const options = neighborhoods.map(n => ({ value: n.id, label: n.name }));
    return (
        <Select
            options={options}
            isClearable
            placeholder="Search"
        />
    );
}