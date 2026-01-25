import { COLORS } from "../constants";


export function ResultsButton({showResults}){
    return(<div style ={{padding: '5px 0px'}}>
                <button
                    onClick={showResults}
                    style={{
                        fontWeight: 700,
                        border: 'none',
                        color: COLORS.lifted_background,
                        background: COLORS.deep_red,
                        cursor: 'pointer',
                        boxShadow:
                            `0 6px 14px ${COLORS.dark_blue}`,
                        flexShrink: 0,
                        width: '100%',
                        fontSize: '0.875rem',
                        minHeight: 52,
                        borderRadius: 5,

                        
                    }}
                >
                    Show Results
                </button>
            </div>
    )
}