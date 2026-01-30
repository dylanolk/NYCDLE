import { COLORS } from "../constants";

type GoalBoxProps = {
    startNeighborhoodName: string;
    endNeighborhoodName: string;
    practice: boolean;
};

export function GoalBox({
    startNeighborhoodName,
    endNeighborhoodName,
    practice = false,
}: GoalBoxProps) {
    const containerStyle: React.CSSProperties = {
        border: `2px solid ${practice ? COLORS.deep_red : COLORS.blue}`,
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
    0 4px 12px rgba(0, 0, 0, 0.61),
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
        color: COLORS.pale_red,
        fontWeight: 700,
    };

    const endStyle: React.CSSProperties = {
        color: COLORS.blue,
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
                    {practice ? <span>For <span style={{ color: COLORS.deep_red, fontWeight: 700 }}>practice, </span></span> : <span>Today, </span>} let's< span style={burrowStyle} > burrow</span > from{' '}
                    <span style={startStyle}>{startNeighborhoodName}</span>{' '}
                    to{' '}
                    <span style={endStyle}>{endNeighborhoodName}</span>
                </div >
            </div >
        </div>
    );
}
