// components/HomepageMediaCarousel.tsx

'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import type { Project } from '@/types/database'

type Props = {
    projects: Project[]
    interval?: number
}

function isImage(url: string) {
    const cleanUrl = url
        .split('?')[0]
        .toLowerCase()

    return /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(
        cleanUrl
    )
}

function shuffleArray<T>(items: T[]) {
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

export default function HomepageMediaCarousel({
    projects,
    interval = 4000,
}: Props) {
    const allImages = useMemo(() => {
        return projects.flatMap((project) =>
            (project.media ?? [])
                .filter(isImage)
                .map((url) => ({
                    url,
                    projectId: project.id,
                    slug: project.slug,
                    namePt: project.name_pt,
                    nameEn: project.name_en,
                }))
        )
    }, [projects])

    const [images, setImages] = useState(
        allImages
    )

    const [currentIndex, setCurrentIndex] =
        useState(0)

    useEffect(() => {
        setImages(shuffleArray(allImages))
        setCurrentIndex(0)
    }, [allImages])

    useEffect(() => {
        if (images.length <= 1) {
            return
        }

        const timer = window.setInterval(() => {
            setCurrentIndex((current) => {
                if (
                    current ===
                    images.length - 1
                ) {
                    setImages((currentImages) =>
                        shuffleArray(
                            currentImages
                        )
                    )

                    return 0
                }

                return current + 1
            })
        }, interval)

        return () =>
            window.clearInterval(timer)
    }, [images.length, interval])

    if (images.length === 0) {
        return null
    }

    return (
        <section
            className="
                relative
                h-[70vh]
                min-h-[450px]
                w-full
                overflow-hidden
                bg-black
                md:h-screen
            "
            aria-label="Galeria de projetos"
        >
            {images.map((image, index) => {
                const isActive =
                    index === currentIndex

                return (
                    <div
                        key={`${image.projectId}-${image.url}-${index}`}
                        className={`
                            absolute
                            inset-0
                            transition-all
                            duration-[1400ms]
                            ease-[cubic-bezier(0.22,1,0.36,1)]
                            ${
                                isActive
                                    ? 'visible scale-100 opacity-100'
                                    : 'invisible scale-[1.03] opacity-0'
                            }
                        `}
                    >
                        <Image
                            src={image.url}
                            alt=""
                            fill
                            priority={index === 0}
                            sizes="100vw"
                            className="object-cover"
                        />
                    </div>
                )
            })}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-black/10
                "
            />

            {images.length > 1 && (
                <div
                    className="
                        absolute
                        bottom-5
                        right-5
                        z-10
                        text-xs
                        tracking-widest
                        text-[#F4EEDB]
                        md:bottom-8
                        md:right-8
                    "
                >
                    {String(
                        currentIndex + 1
                    ).padStart(2, '0')}
                    {' / '}
                    {String(images.length).padStart(
                        2,
                        '0'
                    )}
                </div>
            )}
        </section>
    )
}   