type PageContainerProps = {
    children: React.ReactNode
    className?: string
}

export default function PageContainer({
    children,
    className = '',
}: PageContainerProps) {
    return (
        <main
            className={`
                min-h-screen
                w-full
                px-8
                pt-28
                pb-32
                ${className}
            `}
        >
            {children}
        </main>
    )
}