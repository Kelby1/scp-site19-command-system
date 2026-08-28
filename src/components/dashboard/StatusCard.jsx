function StatusCard({ label, value, status }) {
    return(
        <article className="status-card">
            <span className="status-card__label">{label}</span>
            <strong className="status-card__value">{value}</strong>

            {status&&(
                <span className="status-card__status">{status}</span>
            )}
        </article>
    );
}

export default StatusCard;