type PageHeaderProps = {
    title: string
    description?: string
}

export default function PageHeader({
    title,
    description,
}: PageHeaderProps) {
    return (
        <header className="mb-20">
            <h1
                className="
                    text-5xl
                    md:text-8xl
                    leading-none
                    tracking-tight
                "
            >
                {title}
            </h1>

            {description && (
                <p
                    className="
                        mt-6
                        max-w-2xl
                        text-lg
                        leading-relaxed
                        text-neutral-600
                    "
                >
                    {description}
                </p>
            )}
        </header>
    )
}