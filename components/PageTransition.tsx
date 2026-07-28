'use client'

import {
    useEffect,
    useState,
    type ReactNode,
} from 'react'

type PageTransitionProps = {
    children: ReactNode
    className?: string
}

export default function PageTransition({
    children,
    className = '',
}: PageTransitionProps) {
    const [isVisible, setIsVisible] =
        useState(false)

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsVisible(true)
        })

        return () => {
            cancelAnimationFrame(frame)
        }
    }, [])

    return (
        <div
            className={`
                transition-opacity
                duration-1000
                ease-out
                ${
                    isVisible
                        ? 'opacity-100'
                        : 'opacity-0'
                }
                ${className}
            `}
        >
            {children}
        </div>
    )
}