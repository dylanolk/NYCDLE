import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'
import { COLORS } from '../constants'

export function PracticeSettings({ setEnabledBoros, onClose, showPracticeSettings, boroNames, practiceSettings }) {
    const [enabled, setEnabled] = useState(Array.from(practiceSettings.enabled_boros))

    const toggle = (name: string) => {
        if(enabled.includes(name)){
            setEnabled(enabled.filter(n => n != name))
        }
        else setEnabled([...enabled, name])
    }

    const handleSubmit = () => {
        setEnabledBoros(enabled)
        onClose()
    }

    return (
        <Dialog open={showPracticeSettings} onClose={onClose}>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Centering wrapper */}
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
                        width: window.innerWidth <= 820 ? '90%' : '30%',
                        maxHeight: '80vh',
                        padding: '1.375rem',
                        borderRadius: '16px',
                        background: COLORS.dark_blue,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow:
                            '0 30px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                    }}
                >
                    <DialogTitle
                        style={{
                            color: COLORS.lifted_background,
                            fontSize: '28px',
                            fontWeight: 800,
                            textAlign: 'center',
                        }}
                    >
                        Practice Settings
                    </DialogTitle>

                    {/* Checkboxes */}
     {/* Checkboxes */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
    <div style={{background: COLORS.deep_red, width: 'fit-content', padding: '10px', borderRadius: '5px'}}>
    <span style={{
        color: COLORS.lifted_background,
        fontFamily:
            '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: 700
    }}> Enabled Boroughs </span>
    </div>
    {boroNames.map(name => {
        const isOn = enabled.includes(name)

        return (
            <label
                key={name}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isOn
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(255,255,255,0.05)',
                    border: isOn
                        ? `1px solid ${COLORS.deep_red}`
                        : '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%',
                }}
            >
                {/* Text */}
                <span
                    style={{
                        color: COLORS.lifted_background,
                        fontSize: '16px',
                        fontWeight: 500,
                    }}
                >
                    {name}
                </span>

                {/* Visual checkbox */}
                <span
                    style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        background: isOn ? COLORS.deep_red : 'transparent',
                        border: isOn
                            ? `1px solid ${COLORS.deep_red}`
                            : '1px solid rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 700,
                        transition: 'all 0.15s ease',
                    }}
                >
                    {isOn ? '✓' : null}
                </span>

                {/* Real checkbox */}
                <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggle(name)}
                    style={{
                        position: 'absolute',
                        opacity: 0,
                        pointerEvents: 'none',
                    }}
                />
            </label>
        )
    })}
</div>


                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        style={{
                            marginTop: '12px',
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: 'none',
                            background: COLORS.deep_red,
                            color: COLORS.lifted_background,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Save Settings
                    </button>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
