'use client'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import type { Locale } from '@/lib/dictionaries'
import type { Project } from '@/types/database'
import Link from 'next/link'

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

    const [isVisible, setIsVisible] =
        useState(false)

    const [
        activeProjectId,
        setActiveProjectId,
    ] = useState<string | null>(null)

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsVisible(true)
        })

        return () => {
            cancelAnimationFrame(frame)
        }
    }, [])

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

    const activeProject = useMemo(
        () =>
            projects.find(
                (project) =>
                    project.id === activeProjectId
            ) ?? null,
        [projects, activeProjectId]
    )

    const activeBackground =
        activeProject?.media?.[0] ?? null

    function getProjectName(project: Project) {
        return locale === 'pt'
            ? project.name_pt
            : project.name_en || project.name_pt
    }

    function getProjectDescription(
        project: Project
    ) {
        return locale === 'pt'
            ? project.description_pt
            : project.description_en ||
                  project.description_pt
    }

    function toggleProject(projectId: string) {
        setActiveProjectId((currentId) =>
            currentId === projectId
                ? null
                : projectId
        )
    }

    return (
        <section className="relative w-full pt-20">
            {/* Imagem de fundo do projeto ativo */}
            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    fixed
                    inset-0
                    z-0
                    overflow-hidden
                    bg-black
                "
            >
                {activeBackground && (
                    <div
                        className="
                            absolute
                            inset-0
                            bg-cover
                            bg-center
                            bg-no-repeat
                            transition-all
                            duration-700
                            ease-out
                        "
                        style={{
                            backgroundImage: `url(${activeBackground})`,
                        }}
                    />
                )}

                <div
                    className={`
                        absolute
                        inset-0
                        bg-black
                        transition-opacity
                        duration-700

                        ${
                            activeBackground
                                ? 'opacity-55'
                                : 'opacity-100'
                        }
                    `}
                />
            </div>

            {/* Projetos em destaque */}
            <div
                className="
                    relative
                    z-10
                    flex
                    min-h-screen
                    flex-col
                    justify-start
                    px-4
                    md:px-8
                "
            >
                {featuredProjects.map(
                    (project, index) => {
                        const projectName =
                            getProjectName(project)

                        const projectDescription =
                            getProjectDescription(
                                project
                            )

                        const isProjectOpen =
                            activeProjectId === project.id

                        const descriptionId = `featured-project-description-${project.id}`

                        return (
                            <article
                                key={project.id}
                                style={{
                                    transitionDelay: `${index * 80}ms`,
                                    transitionTimingFunction:
                                        'cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                                className={`
                                    border-b
                                    border-transparent
                                    transition-[opacity,transform,border-color]
                                    duration-[900ms]
                                    motion-reduce:translate-y-0
                                    motion-reduce:opacity-100
                                    motion-reduce:transition-none

                                    ${
                                        isVisible
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-3 opacity-0'
                                    }

                                    ${
                                        isProjectOpen
                                            ? 'border-current/30'
                                            : ''
                                    }
                                `}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleProject(
                                            project.id
                                        )
                                    }
                                    aria-expanded={
                                        isProjectOpen
                                    }
                                    aria-controls={
                                        descriptionId
                                    }
                                    className="
                                        group
                                        flex
                                        w-full
                                        items-center
                                        py-3
                                        text-left
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
                                            className={`
                                                inline-block
                                                overflow-hidden
                                                whitespace-nowrap
                                                text-2xl
                                                transition-all
                                                duration-500
                                                ease-out

                                                ${
                                                    isProjectOpen
                                                        ? 'mr-4 max-w-16 translate-x-0 rotate-90 text-4xl opacity-100'
                                                        : 'max-w-0 -translate-x-6 opacity-0 group-hover:mr-4 group-hover:max-w-16 group-hover:translate-x-0 group-hover:text-4xl group-hover:opacity-100 group-focus-visible:mr-4 group-focus-visible:max-w-16 group-focus-visible:translate-x-0 group-focus-visible:text-4xl group-focus-visible:opacity-100'
                                                }
                                            `}
                                        >
                                            →
                                        </span>

                                        <h2
                                            className={`
                                                truncate
                                                font-franklin
                                                text-[clamp(2.5rem,7vw,8rem)]
                                                leading-[0.9]
                                                tracking-[-0.06em]
                                                transition-[transform,opacity]
                                                duration-500
                                                ease-out
                                                group-hover:translate-x-2
                                                group-focus-visible:translate-x-2

                                                ${
                                                    activeProjectId &&
                                                    !isProjectOpen
                                                        ? 'opacity-45'
                                                        : 'opacity-100'
                                                }
                                            `}
                                        >
                                            {projectName}
                                        </h2>
                                    </div>

                                    <span
                                        aria-hidden="true"
                                        className={`
                                            ml-4
                                            shrink-0
                                            font-mono
                                            text-lg
                                            transition-transform
                                            duration-500
                                            ease-out

                                            ${
                                                isProjectOpen
                                                    ? 'rotate-45'
                                                    : 'rotate-0'
                                            }
                                        `}
                                    >
                                        +
                                    </span>
                                </button>

                                {/* Descrição expansível */}
                                <div
                                    id={descriptionId}
                                    aria-hidden={
                                        !isProjectOpen
                                    }
                                    className={`
                                        grid
                                        transition-[grid-template-rows]
                                        duration-700
                                        ease-[cubic-bezier(0.22,1,0.36,1)]

                                        ${
                                            isProjectOpen
                                                ? 'grid-rows-[1fr]'
                                                : 'grid-rows-[0fr]'
                                        }
                                    `}
                                >
                                    <div className="overflow-hidden">
                                        <div
                                            className={`
                                                grid
                                                gap-6
                                                pb-10
                                                pl-12
                                                pr-4
                                                pt-3
                                                transition-[opacity,transform]
                                                duration-700
                                                md:grid-cols-[minmax(0,1fr)_auto]
                                                md:pl-16
                                                md:pr-12

                                                ${
                                                    isProjectOpen
                                                        ? 'translate-y-0 opacity-100'
                                                        : '-translate-y-3 opacity-0'
                                                }
                                            `}
                                        >
                                            <p
                                                className="
                                                    max-w-3xl
                                                    whitespace-pre-line
                                                    font-mono
                                                    text-sm
                                                    leading-relaxed
                                                    md:text-base
                                                    md:leading-relaxed
                                                "
                                            >
                                                {projectDescription ||
                                                    (locale ===
                                                    'pt'
                                                        ? 'Este projeto ainda não possui descrição.'
                                                        : 'This project does not have a description yet.')}
                                            </p>

                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    gap-6
                                                    font-mono
                                                    text-xs
                                                    uppercase
                                                    tracking-[0.12em]
                                                    opacity-70
                                                "
                                            >
                                                {project.client && (
                                                    <span>
                                                        {
                                                            project.client
                                                        }
                                                    </span>
                                                )}

                                                {project.year && (
                                                    <span>
                                                        {
                                                            project.year
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )
                    }
                )}

                {featuredProjects.length === 0 && (
                    <p
                        style={{
                            transitionTimingFunction:
                                'cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                        className={`
                            text-sm
                            transition-[opacity,transform]
                            duration-[900ms]
                            motion-reduce:translate-y-0
                            motion-reduce:opacity-50
                            motion-reduce:transition-none

                            ${
                                isVisible
                                    ? 'translate-y-0 opacity-50'
                                    : 'translate-y-3 opacity-0'
                            }
                        `}
                    >
                        {locale === 'pt'
                            ? 'Nenhum projeto em destaque.'
                            : 'No featured projects.'}
                    </p>
                )}
            </div>

            {/* Arquivo */}
            <div
                className="
                    relative
                    z-10
                    px-4
                    pb-32
                    md:px-8
                "
            >
                <div
                    style={{
                        transitionDelay: `${
                            featuredProjects.length * 80
                        }ms`,
                        transitionTimingFunction:
                            'cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    className={`
                        border-y
                        border-current/20
                        transition-[opacity,transform]
                        duration-[900ms]
                        motion-reduce:translate-y-0
                        motion-reduce:opacity-60
                        motion-reduce:transition-none

                        ${
                            isVisible
                                ? 'translate-y-0 opacity-60'
                                : 'translate-y-3 opacity-0'
                        }
                    `}
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
                            font-mono
                            text-sm
                            uppercase
                            tracking-[0.15em]
                            transition-opacity
                            duration-300
                            hover:opacity-70
                        "
                    >
                        <span>
                            Archive (
                            {archiveProjects.length})
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
                        aria-hidden={!isArchiveOpen}
                        className={`
                            grid
                            transition-[grid-template-rows]
                            duration-700
                            ease-[cubic-bezier(0.22,1,0.36,1)]

                            ${
                                isArchiveOpen
                                    ? 'grid-rows-[1fr]'
                                    : 'grid-rows-[0fr]'
                            }
                        `}
                    >
                        <div className="overflow-hidden">
                            <div className="pb-6 font-mono">
                                {archiveProjects.map((project, index) => {
                                    const projectName =
                                        locale === 'pt'
                                            ? project.name_pt
                                            : project.name_en || project.name_pt

                                    return (
                                        <Link
                                            key={project.id}
                                            href={`/${locale}/projetos/${project.slug}`}
                                            tabIndex={isArchiveOpen ? 0 : -1}
                                            style={{
                                                transitionDelay: isArchiveOpen
                                                    ? `${index * 50}ms`
                                                    : '0ms',
                                                transitionTimingFunction:
                                                    'cubic-bezier(0.22, 1, 0.36, 1)',
                                            }}
                                            className={`
                                                group
                                                flex
                                                w-full
                                                items-center
                                                justify-between
                                                gap-6
                                                py-3
                                                text-left
                                                text-sm
                                                transition-[opacity,transform]
                                                duration-700
                                                hover:opacity-70
                                                md:text-base
                                                motion-reduce:translate-y-0
                                                motion-reduce:transition-none

                                                ${
                                                    isArchiveOpen
                                                        ? 'translate-y-0 opacity-100'
                                                        : 'translate-y-3 opacity-0'
                                                }
                                            `}
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
                                                {projectName}
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
                                                        {project.year}
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
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}