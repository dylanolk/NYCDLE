import React from 'react';
import { Infinity, Info } from 'lucide-react';

type HeaderProps = {
    showPracticeMode: () => void;
    showInfoScreen: () => void;
    showHome: () => void;
    practice: boolean; 
};

export function Header({ showPracticeMode, showInfoScreen, showHome, practice }: HeaderProps) {
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1.5rem',
        width: '100%',
        background: '#191923 ',
        borderBottom: '2px solid #0E79B2',
        boxSizing: 'border-box',
        height: '60px',
        boxShadow: `
      0 4px 12px rgba(0, 0, 0, 0.61),
      0 1px 3px rgba(0, 0, 0, 0.06)
    `,
    };

    const logoStyle: React.CSSProperties = {
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        color: '#7FB685',
        margin: 0,
        cursor: 'pointer'
    };

    const iconStyle: React.CSSProperties = {
        cursor: 'pointer',
        color: '#0E79B2',
        transition: 'transform 0.2s ease',
        padding: '5px'
    };

    const infinityContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '2px solid #0E79B2',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: "1/1",
        borderRadius: '50%'
    };
    const infoContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '100%',
        maxHeight: '100%',
        aspectRatio: "1/1",
    };

    const infoStyle: React.CSSProperties = {
        cursor: 'pointer',
        color: '#0E79B2',
        transition: 'transform 0.2s ease',
        padding: '5px'
    }

    const practiceStyle: React.CSSProperties ={
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 'bold',
        color: '#7FB685',
        margin: 0,
        cursor: 'pointer'
    }


    return (
        <header style={containerStyle}>

            <div style={infinityContainerStyle} title="Practice Mode" onClick={showPracticeMode}>
                <Infinity style={iconStyle} />
            </div>


            <span onClick={showHome}><h1 style={logoStyle}>burrow</h1> {practice ? <h5 style={practiceStyle}>practice</h5>: null}</span>

            <div style={infoContainerStyle} title="Info" onClick={showInfoScreen}>
                <Info size ={40} style={infoStyle} />
            </div>
        </header >
    );
}
