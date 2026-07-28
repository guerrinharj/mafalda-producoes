'use client'

import {
    useEffect,
    useRef,
    useState,
} from 'react'

type ClickMark = {
    id: number
    x: number
    y: number
}

export default function CustomCursor() {
    const cursorRef =
        useRef<HTMLDivElement>(null)

    const positionRef = useRef({
        mouseX: 0,
        mouseY: 0,
        cursorX: 0,
        cursorY: 0,
    })

    const animationFrameRef =
        useRef<number | null>(null)

    const [isVisible, setIsVisible] =
        useState(false)

    const [isPressed, setIsPressed] =
        useState(false)

    const [isHovering, setIsHovering] =
        useState(false)

    const [clickMarks, setClickMarks] =
        useState<ClickMark[]>([])

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(pointer: fine)'
        )

        if (!mediaQuery.matches) {
            return
        }

        const position = positionRef.current

        const animateCursor = () => {
            position.cursorX +=
                (position.mouseX -
                    position.cursorX) *
                0.18

            position.cursorY +=
                (position.mouseY -
                    position.cursorY) *
                0.18

            if (cursorRef.current) {
                cursorRef.current.style.transform = `
                    translate3d(
                        ${position.cursorX}px,
                        ${position.cursorY}px,
                        0
                    )
                    translate(-50%, -50%)
                `
            }

            animationFrameRef.current =
                requestAnimationFrame(
                    animateCursor
                )
        }

        const handleMouseMove = (
            event: MouseEvent
        ) => {
            position.mouseX = event.clientX
            position.mouseY = event.clientY

            setIsVisible(true)

            const target =
                event.target as HTMLElement

            const interactiveElement =
                target.closest(
                    `
                        a,
                        button,
                        input,
                        textarea,
                        select,
                        label,
                        [role="button"],
                        [data-cursor="interactive"]
                    `
                )

            setIsHovering(
                Boolean(interactiveElement)
            )
        }

        const handleMouseEnter = () => {
            setIsVisible(true)
        }

        const handleMouseLeave = () => {
            setIsVisible(false)
        }

        const handleMouseDown = (
            event: MouseEvent
        ) => {
            setIsPressed(true)

            const id = Date.now()

            setClickMarks((currentMarks) => [
                ...currentMarks,
                {
                    id,
                    x: event.clientX,
                    y: event.clientY,
                },
            ])

            window.setTimeout(() => {
                setClickMarks(
                    (currentMarks) =>
                        currentMarks.filter(
                            (mark) =>
                                mark.id !== id
                        )
                )
            }, 900)
        }

        const handleMouseUp = () => {
            setIsPressed(false)
        }

        document.addEventListener(
            'mousemove',
            handleMouseMove
        )

        document.addEventListener(
            'mouseenter',
            handleMouseEnter
        )

        document.addEventListener(
            'mouseleave',
            handleMouseLeave
        )

        document.addEventListener(
            'mousedown',
            handleMouseDown
        )

        document.addEventListener(
            'mouseup',
            handleMouseUp
        )

        animationFrameRef.current =
            requestAnimationFrame(
                animateCursor
            )

        return () => {
            document.removeEventListener(
                'mousemove',
                handleMouseMove
            )

            document.removeEventListener(
                'mouseenter',
                handleMouseEnter
            )

            document.removeEventListener(
                'mouseleave',
                handleMouseLeave
            )

            document.removeEventListener(
                'mousedown',
                handleMouseDown
            )

            document.removeEventListener(
                'mouseup',
                handleMouseUp
            )

            if (
                animationFrameRef.current !==
                null
            ) {
                cancelAnimationFrame(
                    animationFrameRef.current
                )
            }
        }
    }, [])

    return (
        <>
            <div
                ref={cursorRef}
                aria-hidden="true"
                className={`
                    custom-cursor
                    ${isVisible
                        ? 'custom-cursor--visible'
                        : ''
                    }
                    ${isPressed
                        ? 'custom-cursor--pressed'
                        : ''
                    }
                    ${isHovering
                        ? 'custom-cursor--hovering'
                        : ''
                    }
                `}
            />

            {clickMarks.map((mark) => (
                <span
                    key={mark.id}
                    aria-hidden="true"
                    className="custom-cursor-click"
                    style={{
                        left: mark.x,
                        top: mark.y,
                    }}
                />
            ))}
        </>
    )
}