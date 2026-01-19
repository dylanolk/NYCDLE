import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import React, { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ColorCodes } from './App'

type LoseScreenProps = {
    gaveUp: boolean
    onClose: () => void
    colorTracker: any
}

const emoji_dict = {
    green: '🟩',
    red: '🟥',
    orange: '🟧',
    grey: '⬜'
}

export function LoseScreen({ gaveUp, onClose, colorTracker }: LoseScreenProps) {
    const [copied, setCopied] = useState(false)
    const emoji_string = colorTracker.map((c) => emoji_dict[c]).join('')
    var text_to_copy = `I just finished today's burrow!\n${emoji_string}`
    const hint_counter = colorTracker.filter((c) => c == ColorCodes.Hint).length
    if (hint_counter) text_to_copy += `\nand I used ${hint_counter} hints!`

    if (colorTracker.length) text_to_copy += "\n...and then I gave up!"
    else text_to_copy += "\n...I didn't even try!"
    text_to_copy += "\nburrow.dylanolk.com"

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text_to_copy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={gaveUp} onClose={onClose}>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            <DialogPanel
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '360px',
                    background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
                    padding: '28px',
                    borderRadius: '18px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                }}
            >
                <DialogTitle style={{ fontSize: '28px', fontWeight: 800 }}>
                    Better luck next time!
                </DialogTitle>

                <Description style={{ color: '#555', marginBottom: '16px' }}>
                    You completed today’s burrow
                </Description>

                <div
                    style={{
                        fontSize: '26px',
                        padding: '10px 14px',
                        background: '#fff',
                        borderRadius: '10px',
                        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
                        marginBottom: '20px',
                    }}
                >
                    {emoji_string}
                </div>

                <button
                    onClick={handleCopy}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#111',
                        color: 'white',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        marginBottom: '10px',
                    }}
                >
                    {copied ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Results'}
                </button>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid #ccc',
                        background: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Close
                </button>
            </DialogPanel>
        </Dialog>
    )
}


