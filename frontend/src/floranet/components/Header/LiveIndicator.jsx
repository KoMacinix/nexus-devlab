/** Petit indicateur "En direct" — point pulsant + label vert. */
export function LiveIndicator() {
    return (
        <div className="live-indicator">
            <div className="live-dot" />
            <span className="live-label">En direct</span>
        </div>
    );
}
