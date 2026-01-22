import { COLORS } from "../constants";

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
        border: `2px solid ${COLORS.pale_blue}`,
        borderRadius: '10px',
        padding: '3% 5% 3%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: COLORS.lifted_background,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.52)',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 14px',
        borderRadius: '8px',
        border: `1px solid ${COLORS.blue}`,
        background: COLORS.lifted_background,
        color: COLORS.blue,
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.15s ease, transform 0.05s ease',
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    };

    const give_up_button_style: React.CSSProperties = {
        ...buttonStyle,
        border: `1px solid ${COLORS.deep_red}`,
        color: COLORS.deep_red,
        background: COLORS.lifted_background,
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
                style={give_up_button_style}
                onClick={giveUp}
            >
                Give Up
            </button>
        </div>
    );
}
