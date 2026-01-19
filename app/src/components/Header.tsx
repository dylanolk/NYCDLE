type HeaderProps = {
    startNeighborhoodName: string;
    endNeighborhoodName: string;
};

export function Header({
    startNeighborhoodName,
    endNeighborhoodName,
}: HeaderProps) {
    const containerStyle: React.CSSProperties = {
        border: '2px solid #4A90E2',
        borderRadius: '1rem',
        padding: '.5rem 1rem',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #F9FBFF 0%, #F1F6FF 100%)',
        boxSizing: 'border-box',
    };
    const wrapperStyle: React.CSSProperties = {
        padding: '1rem 0rem', 
        width: '100%',
    }

    const titleStyle: React.CSSProperties = {
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 'clamp(1rem, 1.2rem, 1.5rem)',
        fontWeight: 500,
        letterSpacing: '-0.015em',
        lineHeight: 1.35,
        color: '#1F2937',
        textAlign: 'center',
        maxWidth: '100%',
        wordBreak: 'break-word',
    };

    const startStyle: React.CSSProperties = {
        color: '#E58A8A', // pastel red
        fontWeight: 700,
    };

    const endStyle: React.CSSProperties = {
        color: '#7DA9E8', // pastel blue
        fontWeight: 700,
    };

    const burrowStyle: React.CSSProperties = {
        color: '#5f8d0aff', // pastel blue
        fontWeight: 700,
    };

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>
                <div style={titleStyle}>
                    Today I want to <span style={burrowStyle}>burrow</span> from{' '}
                    <span style={startStyle}>{startNeighborhoodName}</span>{' '}
                    to{' '}
                    <span style={endStyle}>{endNeighborhoodName}</span>
                </div>
            </div>
        </div>
    );
}
