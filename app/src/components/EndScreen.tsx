import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ColorCodes } from './App.tsx'
import React, { useState } from 'react';
type EndScreenProps = {
    endScreenVisible: boolean;
    onClose: () => void;
    colorTracker: any;
};

const emoji_dict = {
    "green": '🟩',
    "red": '🟥',
    "orange": '🟧'
}


export function EndScreen({ endScreenVisible, onClose, colorTracker }: EndScreenProps) {
    const [copied, setCopied] = useState(false);
    const emoji_string = colorTracker.map((color) => emoji_dict[color]).join('')
    const textToCopy = `I just beat today's WARDle!\n ${emoji_string}\ndylanolk.github.io/NYCDLE`;
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <Dialog open={endScreenVisible} onClose={onClose}>
            <DialogPanel style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <DialogTitle>Congrats!</DialogTitle>
                <Description>You've completed the game!</Description>
                <Description>{emoji_string}</Description>
                <button onClick={onClose} style={{ marginTop: '10px', padding: '5px 10px' }}>Close</button>
                <button onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
            </DialogPanel>
        </Dialog>
    );
}