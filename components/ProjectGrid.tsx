'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { Locale } from '@/lib/dictionaries'
import type { Project } from '@/types/database'

type Props = {
    projects: Project[]
    locale: Locale
}

export default function ProjectGrid({
    projects,
    locale,
}: Props) {
    const [isArchiveOpen, setIsArchiveOpen] =
        useState(false)

    const featuredProjects = projects.filter(
        (project) => project.is_featured === true
    )

    const archiveProjects = [...projects].sort(
        (a, b) => {
            const yearA = Number(a.year) || 0
            const yearB = Number(b.year) || 0

            if (yearA !== yearB) {
                return yearB - yearA
            }

            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
        }
    )

    return (
        <section className="relative w-full">
            <div
                className="
                    flex
                    min-h-screen
                    flex-col
                    justify-center
                    px-4
                    py-32
                    md:px-8
                "
            >
                {featuredProjects.map(
                    (project, index) => {
                        const projectName =
                            locale === 'pt'
                                ? project.name_pt
                                : project.name_en ||
                                  project.name_pt

                        return (
                            <Link
                                key={project.id}
                                href={`/${locale}/projetos/${project.slug}`}
                                className="
                                    group
                                    flex
                                    items-center
                                    border-b
                                    border-current/30
                                    py-3
                                    md:py-4
                                "
                            >
                                <span
                                    className="
                                        mr-4
                                        w-8
                                        shrink-0
                                        text-xs
                                        opacity-60
                                        md:mr-8
                                    "
                                >
                                    {String(
                                        index + 1
                                    ).padStart(2, '0')}
                                </span>

                                <div
                                    className="
                                        flex
                                        min-w-0
                                        flex-1
                                        items-center
                                        overflow-hidden
                                    "
                                >
                                    <span
                                        aria-hidden="true"
                                        className="
                                            inline-block
                                            max-w-0
                                            -translate-x-6
                                            overflow-hidden
                                            whitespace-nowrap
                                            opacity-0
                                            transition-all
                                            duration-500
                                            ease-out
                                            group-hover:mr-4
                                            group-hover:max-w-16
                                            group-hover:translate-x-0
                                            group-hover:opacity-100
                                            group-focus-visible:mr-4
                                            group-focus-visible:max-w-16
                                            group-focus-visible:translate-x-0
                                            group-focus-visible:opacity-100
                                            md:group-hover:mr-6
                                            md:group-focus-visible:mr-6
                                        "
                                    >
                                        →
                                    </span>

                                    <h2
                                        className="
                                            truncate
                                            text-[clamp(2.5rem,7vw,8rem)]
                                            leading-[0.9]
                                            tracking-[-0.06em]
                                            transition-transform
                                            duration-500
                                            ease-out
                                            group-hover:translate-x-2
                                            group-focus-visible:translate-x-2
                                        "
                                    >
                                        {projectName}
                                    </h2>
                                </div>
                            </Link>
                        )
                    }
                )}

                {featuredProjects.length === 0 && (
                    <p className="text-sm opacity-50">
                        Nenhum projeto em destaque.
                    </p>
                )}
            </div>

            <div
                className="
                    px-4
                    pb-32
                    md:px-8
                "
            >
                <div
                    className="
                        border-t
                        border-b
                        border-current/20
                        opacity-60
                    "
                >
                    <button
                        type="button"
                        onClick={() =>
                            setIsArchiveOpen(
                                (current) => !current
                            )
                        }
                        aria-expanded={isArchiveOpen}
                        aria-controls="projects-archive"
                        className="
                            flex
                            w-full
                            items-center
                            justify-between
                            py-5
                            text-left
                            text-sm
                            uppercase
                            tracking-[0.15em]
                            transition-opacity
                            duration-300
                            hover:opacity-70
                        "
                    >
                        <span>
                            Archive ({archiveProjects.length})
                        </span>

                        <span
                            aria-hidden="true"
                            className={`
                                text-lg
                                transition-transform
                                duration-500
                                ease-out
                                ${
                                    isArchiveOpen
                                        ? 'rotate-45'
                                        : 'rotate-0'
                                }
                            `}
                        >
                            +
                        </span>
                    </button>

                    <div
                        id="projects-archive"
                        className={`
                            grid
                            transition-[grid-template-rows]
                            duration-500
                            ease-in-out
                            ${
                                isArchiveOpen
                                    ? 'grid-rows-[1fr]'
                                    : 'grid-rows-[0fr]'
                            }
                        `}
                    >
                        <div className="overflow-hidden">
                            <div
                                className="
                                    pb-6
                                "
                            >
                                {archiveProjects.map(
                                    (project) => {
                                        const projectName =
                                            locale === 'pt'
                                                ? project.name_pt
                                                : project.name_en ||
                                                  project.name_pt

                                        return (
                                            <Link
                                                key={
                                                    project.id
                                                }
                                                href={`/${locale}/projetos/${project.slug}`}
                                                className="
                                                    group
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-6
                                                    py-3
                                                    text-sm
                                                    transition-opacity
                                                    duration-300
                                                    hover:opacity-70
                                                    md:text-base
                                                "
                                            >
                                                <span
                                                    className="
                                                        truncate
                                                        transition-transform
                                                        duration-300
                                                        ease-out
                                                        group-hover:translate-x-2
                                                    "
                                                >
                                                    {
                                                        projectName
                                                    }
                                                </span>

                                                <div
                                                    className="
                                                        flex
                                                        shrink-0
                                                        items-center
                                                        gap-5
                                                    "
                                                >
                                                    {project.year && (
                                                        <span className="text-xs opacity-70">
                                                            {
                                                                project.year
                                                            }
                                                        </span>
                                                    )}

                                                    <span
                                                        aria-hidden="true"
                                                        className="
                                                            -translate-x-2
                                                            opacity-0
                                                            transition-all
                                                            duration-300
                                                            group-hover:translate-x-0
                                                            group-hover:opacity-100
                                                        "
                                                    >
                                                        →
                                                    </span>
                                                </div>
                                            </Link>
                                        )
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}