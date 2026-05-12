export function FeatureCard({ title, description, icon, typeClass }) {
    return (
        <div className={`feature-card ${typeClass}`}>
            <h3>{icon} {title}</h3>
            <p>{description}</p>
        </div>
    );
}