import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

type EndScreenProps = {
    endScreenVisible: boolean;
};


export function EndScreen({ endScreenVisible }: EndScreenProps) {


    return (
        <Dialog open={endScreenVisible} onClose={() => { }}>
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
                <DialogTitle>Game Over</DialogTitle>
                <Description>You've completed the game!</Description>
            </DialogPanel>
        </Dialog>
    );
}