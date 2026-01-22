type HintBoxProps = {
    showNextNeighborhood: () => void;
    showAllOutlines: () => void;
    giveUp: () => void;
};

export function HintBox({
    showNextNeighborhood,
    showAllOutlines,
    giveUp,
}: HintBoxProps) {
    const containerStyle: React.CSSProperties = {
        flex: 2,
        border: '2px solid #4A90E2',
        borderRadius: '10px',
        padding: '3% 1% 3%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#F9FBFF',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #4A90E2',
        background: '#FFFFFF',
        color: '#2C5FA8',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s ease, transform 0.05s ease',
    };

    const dangerButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        border: '1px solid #E24A4A',
        color: '#A82C2C',
        background: '#FFF5F5',
    };

    return (
        <div style={containerStyle}>
            <button
                style={buttonStyle}
                onClick={showNextNeighborhood}
            >
                Show Next Neighborhood
            </button>

            <button
                style={buttonStyle}
                onClick={showAllOutlines}
            >
                Show All Outlines
            </button>

            <button
                style={dangerButtonStyle}
                onClick={giveUp}
            >
                Give Up
            </button>
        </div>
    );
}
