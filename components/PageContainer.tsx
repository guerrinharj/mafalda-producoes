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
                mx-8
                pb-32
                ${className}
            `}
        >
            {children}
        </main>
    )
}