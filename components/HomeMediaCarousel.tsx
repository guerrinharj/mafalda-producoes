'use client'

import Image from 'next/image'
import {
    useEffect,
    useState,
} from 'react'

type Props = {
    media: string[]
}

const IMAGE_DURATION = 700

function shuffleMedia(items: string[]) {
    const shuffled = [...items]

    for (
        let index = shuffled.length - 1;
        index > 0;
        index--
    ) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1)
        )

        ;[
            shuffled[index],
            shuffled[randomIndex],
        ] = [
            shuffled[randomIndex],
            shuffled[index],
        ]
    }

    return shuffled
}

export default function HomeMediaCarousel({
    media,
}: Props) {
    const [carouselMedia, setCarouselMedia] =
        useState<string[]>(media)

    const [currentIndex, setCurrentIndex] =
        useState(0)

    const [previousIndex, setPreviousIndex] =
        useState<number | null>(null)

    useEffect(() => {
        setCarouselMedia(shuffleMedia(media))
        setCurrentIndex(0)
        setPreviousIndex(null)
    }, [media])

    useEffect(() => {
        if (carouselMedia.length <= 1) {
            return
        }

        const interval = window.setInterval(() => {
            setCurrentIndex((current) => {
                setPreviousIndex(current)

                return (
                    (current + 1) %
                    carouselMedia.length
                )
            })
        }, IMAGE_DURATION)

        return () => {
            window.clearInterval(interval)
        }
    }, [carouselMedia.length])

    if (carouselMedia.length === 0) {
        return null
    }

    const currentMedia =
        carouselMedia[currentIndex]

    const previousMedia =
        previousIndex !== null
            ? carouselMedia[previousIndex]
            : null

    return (
        <div
            aria-hidden="true"
            className="
                pointer-events-none
                absolute
                left-0
                top-0
                h-full
                w-full
                overflow-hidden
                bg-black
            "
        >
            {previousMedia && (
                <Image
                    key={`previous-${previousMedia}`}
                    src={previousMedia}
                    alt=""
                    fill
                    sizes="100vw"
                    className="
                        animate-carousel-fade-out
                        scale-110
                        object-cover
                        opacity-0
                    "
                />
            )}

            <Image
                key={`current-${currentMedia}`}
                src={currentMedia}
                alt=""
                fill
                priority={currentIndex === 0}
                sizes="100vw"
                className="
                    animate-carousel-fade-in
                    scale-110
                    object-cover
                    opacity-70
                "
            />

            <div
                className="
                    absolute
                    inset-0
                    bg-black/25
                "
            />

            <div
                className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]
                "
            />
        </div>
    )
}