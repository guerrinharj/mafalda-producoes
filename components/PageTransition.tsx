'use client'

import { useEffect, useState } from 'react'

type PageTransitionProps = {
    children: React.ReactNode
    className?: string
}

export default function PageTransition({
    children,
    className = '',
}: PageTransitionProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsVisible(true)
        })

        return () => cancelAnimationFrame(frame)
    }, [])

    return (
        <div
            className={`
                transition-all
                duration-1000
                ease-out
                ${
                    isVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-6 opacity-0'
                }
                ${className}
            `}
        >
            {children}
        </div>
    )
}