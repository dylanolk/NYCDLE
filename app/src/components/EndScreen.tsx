import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import React, { useEffect, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { ColorCodes } from './App'
import { COLORS } from '../constants'

type EndScreenProps = {
    endScreenVisible: boolean
    onClose: () => void
    gameState: any
    neighborhoodsDict: any
    optimalRoute: number[]
    practice: boolean
}

const T = {
    space: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.375rem',
        xl: '1.75rem',
    },
    text: {
        body: '0.875rem',
        section: '0.8125rem',
        title: '1.625rem',
    },
    radius: {
        sm: '10px',
        md: '14px',
        lg: '20px',
    },
    color: {
        bgTop: '#fffaf2',
        bgBottom: '#f6efe6',
        cardTop: '#ffffff',
        cardBottom: '#f0ebe4',
        textPrimary: COLORS.lifted_background,
        textSecondary: COLORS.lifted_background,
        accent: '#e14b4b',
        accentAlt: '#3b8ea5',
    },
}

export function EndScreen({ endScreenVisible, onClose, gameState, neighborhoodsDict, optimalRoute, practice }: EndScreenProps) {
    const emoji_dict = {
        [ColorCodes.Good]: '🟩',
        [ColorCodes.Bad]: '🟥',
        [ColorCodes.Close]: '🟧',
        [ColorCodes.Hint]: '⬜'
    }
    const [copied, setCopied] = useState(false)
    var emoji_string = ""
    var text_to_copy = ""
    var hint_counter = 0
    if (!gameState.gave_up) {
        emoji_string = gameState.color_tracker.map((c) => emoji_dict[c]).join('')
        text_to_copy = "I just beat" + (!practice ? " today's daily burrow!" : ` a practice burrow from ${neighborhoodsDict[gameState.start_neighborhood_id]?.name} to ${neighborhoodsDict[gameState.end_neighborhood_id]?.name}`)
        hint_counter = gameState.color_tracker.filter((c) => c == ColorCodes.Hint).length + gameState.showed_outlines
        if (hint_counter) text_to_copy += `\nand I used ${hint_counter} hint` + (hint_counter>1 ?  "s!": "!")
        text_to_copy += "\nburrow.dylanolk.com"
    }
    else {
        emoji_string = gameState.color_tracker.map((c) => emoji_dict[c]).join('')
        text_to_copy = `I just finished today's daily burrow!\n${emoji_string}`
        hint_counter = gameState.color_tracker.filter((c) => c == ColorCodes.Hint).length + gameState.showed_outlines
        if (hint_counter) text_to_copy += `\nand I used ${hint_counter} hint` + (hint_counter>1 ?  "s!": "!")
        if (gameState.color_tracker.length) text_to_copy += "\n...and then I gave up!"
        else text_to_copy += "\n...I didn't even try!"
        text_to_copy += "\nburrow.dylanolk.com"
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text_to_copy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <Dialog open={endScreenVisible} onClose={onClose}>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',


                }}
            />
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1.25rem',
                    fontFamily:
                        '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
            >

<DialogPanel
    style={{
        width: window.innerWidth <= 820 ? "90%" : "30%",
        maxHeight: '80vh',
        padding: T.space.lg,
        borderRadius: T.radius.lg,
        background: COLORS.dark_blue,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
        alignItems: 'center',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
    }}
>

                    <DialogTitle style={{ color: COLORS.lifted_background, fontSize: '28px', fontWeight: 800 }}>
                        {gameState.gave_up ? "Better luck next time" : "🎉 You Did It!"}
                    </DialogTitle>

                    <Description style={{ color: COLORS.lifted_background, marginBottom: '16px' }}>
                        {(gameState.gave_up ? "You gave up on" : "You completed") + (!practice ? " today's burrow!" : " a practice burrow!")}
                    </Description>

                   
                    {
                        practice? null:
                        <Description style = {{color: COLORS.lifted_background}}>
                            Come back tomorrow for a new challenge!
                        </Description>
                    }


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
                            background: COLORS.deep_red,
                            color: COLORS.lifted_background,
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
                     <Description style={{ color: COLORS.lifted_background, marginBottom: '16px' }}>
                        Your route: <span style={{ color: COLORS.deep_red }}>
                            {Object.keys(neighborhoodsDict).length ? neighborhoodsDict[gameState.start_neighborhood_id]?.name + ' → ' : null}
                        </span>

                        {Object.keys(neighborhoodsDict).length ? (
                            gameState.neighborhoods_guessed.map((id, index) => (
                                <span>
                                    <span key={index} style={{ color: gameState.color_tracker[index] == ColorCodes.Hint ? COLORS.background_color : gameState.color_tracker[index] }}>
                                        {neighborhoodsDict[id].name + ' → '}
                                    </span>
                                </span>
                            ))
                        ) : null}
                        {gameState.gave_up ? <span>(Then you gave up)</span> :
                            <span style={{ color: COLORS.blue }}>
                                {Object.keys(neighborhoodsDict).length ? neighborhoodsDict[gameState.end_neighborhood_id]?.name : null}
                            </span>
                        }
                    </Description>

                    {gameState.neighborhoods_guessed.length != optimalRoute.length - 1 ?
                        (<Description style={{ color: COLORS.lifted_background, marginBottom: '16px' }}>
                            You could've done: <span style={{ color: COLORS.deep_red }}>
                                {Object.keys(neighborhoodsDict).length ? neighborhoodsDict[gameState.start_neighborhood_id]?.name + ' → ' : null}
                            </span>

                            {Object.keys(neighborhoodsDict).length ? (
                                optimalRoute.map((id, index) => (
                                    index < optimalRoute.length - 1 ? (<span>
                                        <span key={index} style={{ color: COLORS.logo_color }}>
                                            {neighborhoodsDict[id].name + ' → '}
                                        </span>
                                    </span>) : <span key={index}></span>
                                ))
                            ) : null}

                            <span style={{ color: COLORS.blue }}>
                                {Object.keys(neighborhoodsDict).length ? neighborhoodsDict[gameState.end_neighborhood_id]?.name : null}
                            </span>
                        </Description>) : null
                    }

                </DialogPanel>
            </div>
        </Dialog >
    )
}
