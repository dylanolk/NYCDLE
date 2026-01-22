import { COLORS } from "../constants";

type GoalBoxProps = {
    startNeighborhoodName: string;
    endNeighborhoodName: string;
};

export function GoalBox({
    startNeighborhoodName,
    endNeighborhoodName,
}: GoalBoxProps) {
    const containerStyle: React.CSSProperties = {
        border: '2px solid #4A90E2',
        borderRadius: '1rem',
        padding: '.5rem 1rem',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        background: COLORS.lifted_background,
        boxSizing: 'border-box',
        flexGrow: '1',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 1px 3px rgba(0, 0, 0, 0.06)
    `,
    };

    const wrapperStyle: React.CSSProperties = {
        padding: '1rem 0rem',
        width: '100%',
        flex: '0 1',
        display: 'flex',
    }

    const titleStyle: React.CSSProperties = {
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 'clamp(1rem, 1.5vw, 2.3rem)',
        fontWeight: 500,
        letterSpacing: '-0.015em',
        lineHeight: 1.35,
        color: '#191923',
        maxWidth: '100%',
        wordBreak: 'break-word',
        textAlign: 'center'
    }

    const startStyle: React.CSSProperties = {
        color: '#BF1363',
        fontWeight: 700,
    };

    const endStyle: React.CSSProperties = {
        color: '#0E79B2',
        fontWeight: 700,
    };

    const burrowStyle: React.CSSProperties = {
        color: '#7FB685',
        fontWeight: 700,
    };

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>
                <div style={titleStyle}>
                    Today I want to < span style={burrowStyle} > burrow</span > from{' '}
                    <span style={startStyle}>{startNeighborhoodName}</span>{' '}
                    to{' '}
                    <span style={endStyle}>{endNeighborhoodName}</span>
                </div >
            </div >
        </div >
    );
}
