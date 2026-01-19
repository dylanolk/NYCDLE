import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import React, { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ColorCodes } from './App'

type InfoScreenProps = {
    onClose: () => void
    showInfoScreen: boolean
}

const emoji_dict = {
    green: '🟩',
    red: '🟥',
    orange: '🟧',
    grey: '⬜'
}

export function InfoScreen({ showInfoScreen, onClose,  }: InfoScreenProps) {
    const [copied, setCopied] = useState(false)

    return (
        <Dialog open={showInfoScreen} onClose={onClose}>
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



            
            </DialogPanel>
        </Dialog>
    )
}


