import {
    Description,
    Dialog,
    DialogPanel,
    DialogTitle,
    Disclosure,
} from '@headlessui/react'
import React from 'react'
import { ChevronDown } from 'lucide-react'
import { COLORS } from '../constants'

type InfoScreenProps = {
    showInfoScreen: boolean
    onClose: () => void
}

/* Design tokens */
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

export function InfoScreen({ showInfoScreen, onClose }: InfoScreenProps) {
    return (
        <Dialog open={showInfoScreen} onClose={onClose}>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background:
                        'radial-gradient(circle at 50% 40%, rgba(0,0,0,0.35), rgba(0,0,0,0.55))',
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: T.space.lg,
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

                    }}
                >
                    <DialogTitle
                        style={{
                            fontSize: T.text.title,
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            color: T.color.textPrimary,
                            marginBottom: T.space.sm,
                            flexShrink: 0,
                        }}
                    >
                        Welcome to the NYC burrow!
                    </DialogTitle>

                    {/* Scrollable content */}
                    <div
                        style={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            paddingRight: T.space.xs,
                            marginRight: `-${T.space.xs}`,
                        }}
                    >
                        {/* Media card */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>

                            <div
                                style={{
                                    background: `linear-gradient(180deg, ${T.color.cardTop}, ${T.color.cardBottom})`,
                                    borderRadius: T.radius.md,
                                    padding: T.space.xs,
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08), 0 8px 18px rgba(0,0,0,0.15)',
                                    marginBottom: T.space.md,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    maxWidth: '500px',       // limit max size
                                    aspectRatio: '1/1',     // maintain video ratio
                                    overflow: 'hidden',      // crop anything outside
                                }}
                            >
                                <video
                                    src="/intro.mp4"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: T.radius.sm,
                                        objectFit: 'cover',   // fill without distortion
                                        display: 'block',
                                    }}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </div>


                            {/* Description */}
                            <Description
                                style={{
                                    fontSize: T.text.body,
                                    color: T.color.textSecondary,
                                    lineHeight: 1.55,
                                    marginBottom: T.space.lg,
                                }}
                            >
                                <span style={{ marginBottom: T.space.xs }}>
                                    Connect the <span style={{ color: COLORS.pale_red, fontWeight: 700 }}>starting neighborhood </span>
                                    to the <span style={{ color: COLORS.blue, fontWeight: 700 }}> ending neighborhood </span>
                                    in as few moves as possible.
                                </span>
                                <span>
                                    Neighborhoods are colored <br /> <span style={{ color: COLORS.logo_color, fontWeight: 700 }}>green</span> if they get you closer,<br />
                                    <span style={{ color: 'orange', fontWeight: 700 }}> orange </span> if you've got the right idea,<br />
                                    and <span style={{ color: COLORS.deep_red, fontWeight: 700 }}> red </span> if you weren't close.<br />
                                    Neighborhoods that don't connect to the <span style={{ color: COLORS.pale_red, fontWeight: 700 }}>starting neighborhood</span> are greyed out.
                                </span>
                            </Description>

                            {/* Sections */}
                            <Section title="What counts as a neighborhood?" >
                                <strong>There are no official neighborhood borders for NYC</strong> <br />
                                This means you might disagree with the borders as drawn. Please remember NYC neighborhood borders are fuzzy. <br /><br />
                                The data burrow uses is from <a href='https://data.cityofnewyork.us/City-Government/2020-Neighborhood-Tabulation-Areas-NTAs-/9nt8-h7nd/about_data' target="_blank">Neighborhood Tabulation Areas</a> used for census reporting. <br /><br />
                                <i>Though NTA boundaries and their associated names roughly correspond with many neighborhoods commonly recognized by New Yorkers, NTAs are not intended to definitively represent neighborhoods, nor are they intended to be exhaustive of all possible names and understandings of neighborhoods throughout New York City.</i> <br /> <br />
                                That said, some subjectivity is used. Neighborhoods that are connected by bridge or tunnel in real life should be considered bordering. If you find this is not the case you can contact me at burrow@dylanolk.com
                            </Section>

                            <Section title="Acknowledgements and credits">
                                burrow is created by Dylan Olk. <br /> <br />
                                The game takes much inspiration from the wonderful <a href="https://travle.earth" target="_blank">travle.earth</a> by the talented Oisín Carroll and team. <br /><br />
                                Data is sourced from <a href='https://data.cityofnewyork.us/City-Government/2020-Neighborhood-Tabulation-Areas-NTAs-/9nt8-h7nd/about_data' target="_blank">Neighborhood Tabulation Areas</a> from the city of New York. <br /> <br />
                                burrow is built with React.js using Vite, Headless UI, and d3.

                            </Section>

                            <Section title="Report an issue">
                                If you have any suggestions or experience any bugs you can contact me at burrow@dylanolk.com
                            </Section>
                        </div>
                    </div>
                    {/* Footer */}
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: T.space.md,
                            padding: T.space.sm,
                            fontSize: T.text.body,
                            fontWeight: 700,
                            borderRadius: T.radius.md,
                            border: 'none',
                            background: COLORS.deep_red,
                            color: 'white',
                            cursor: 'pointer',
                            boxShadow:
                                '0 6px 14px rgba(225,75,75,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
                            flexShrink: 0,
                            width: '100%'
                        }}
                    >
                        Play Now
                    </button>
                </DialogPanel>
            </div>
        </Dialog >
    )
}

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <Disclosure>
            {({ open }) => (
                <div style={{ marginBottom: '0.75rem', width: '100%' }}>
                    <Disclosure.Button
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '0.625rem 0.75rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.08)',
                            background:
                                COLORS.blue,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: 600,
                            fontSize: T.text.section,
                            color: T.color.textPrimary,
                            cursor: 'pointer',
                            boxShadow:
                                'inset 0 1px 0 rgba(255,255,255,0.7)',
                        }}
                    >
                        {title}
                        <ChevronDown
                            size={16}
                            style={{
                                transform: open
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                color: T.color.accent,
                            }}
                        />
                    </Disclosure.Button>

                    <Disclosure.Panel
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',        // full width of parent
                            maxWidth: '100%',       // optional max width
                            marginTop: T.space.xs,
                            padding: T.space.sm,
                            borderRadius: T.radius.sm,
                            background: COLORS.dark_blue,
                            fontSize: T.text.section,
                            lineHeight: 1.5,
                            color: T.color.textSecondary,
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                            overflowWrap: 'break-word', // allow long words to wrap
                            wordBreak: 'break-word',    // fallback
                        }}
                    >
                        {children}
                    </Disclosure.Panel>
                </div>
            )}
        </Disclosure>
    )
}
