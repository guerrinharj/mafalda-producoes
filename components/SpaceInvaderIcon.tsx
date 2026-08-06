type Props = {
    className?: string
}

export default function SpaceInvaderIcon({
    className = '',
}: Props) {
    return (
        <svg
            viewBox="0 0 16 16"
            className={className}
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M4 1h2v2h1V1h2v2h1V1h2v3h1v2h-2v2h2v2h-2v2h-2v-2H6v2H4v-2H2V8h2V6H2V4h2z" />
        </svg>
    )
}