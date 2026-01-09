import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { ColorCodes } from './App.tsx'
import React, { useState } from 'react';
type HintBoxProps = {
    showNextNeighborhood: () => null
};


export function HintBox({ showNextNeighborhood }: HintBoxProps) {
    const style = {
        flex: 2,               // large section under search bar
        border: '2px solid #4A90E2',
        borderRadius: '10px',
        paddingTop: '20px',
        width: '100%'
    }
    return (
        <div style={style}>
            Hint Box
        </div>
    );
}