import { notFound } from 'next/navigation'
import Link from 'next/link'

import PageContainer from '@/components/PageContainer'
import PageTransition from '@/components/PageTransition'
import EditProjectButton from '@/components/EditProjectButton'
import DeleteProjectButton from '@/components/DeleteProjectButton'

import {
    isLocale,
    type Locale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/server'

type Props = {
    params: Promise<{
        locale: string
        slug: string
    }>
}

type Project = {
    id: string
    name_pt: string
    name_en: string | null
    slug: string
    client: string | null
    category: string
    year: string | null
    media: string[] | null
    description_pt: string | null
    description_en: string | null
    is_featured: boolean
}

function isVideo(url: string) {
    const cleanUrl = url
        .split('?')[0]
        .toLowerCase()

    return [
        '.mp4',
        '.webm',
        '.mov',
        '.m4v',
    ].some((extension) =>
        cleanUrl.endsWith(extension)
    )
}

export default async function ProjectPage({
    params,
}: Props) {
    const {
        locale,
        slug,
    } = await params

    if (!isLocale(locale)) {
        notFound()
    }

    const supabase = await createClient()

    const {
        data: project,
        error,
    } = await supabase
        .from('projects')
        .select(`
            id,
            name_pt,
            name_en,
            slug,
            client,
            category,
            year,
            media,
            description_pt,
            description_en,
            is_featured
        `)
        .eq('slug', slug)
        .single<Project>()

    if (error || !project) {
        notFound()
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const projectName =
        locale === 'pt'
            ? project.name_pt
            : project.name_en ||
              project.name_pt

    const description =
        locale === 'pt'
            ? project.description_pt
            : project.description_en ||
              project.description_pt

    const media = project.media ?? []

    const backgroundImage =
        media.find(
            (mediaUrl) => !isVideo(mediaUrl)
        ) ?? null

    return (
        <PageContainer>
            <PageTransition>
                <main
                    className="
                        relative
                        min-h-screen
                        overflow-hidden
                        px-4
                        pb-24
                        pt-24
                        md:px-8
                        md:pt-28
                    "
                >
                    {/* Background fixo */}
                    <div
                        aria-hidden="true"
                        className="
                            pointer-events-none
                            fixed
                            inset-0
                            z-0
                            overflow-hidden
                        "
                    >
                        {backgroundImage && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-cover
                                    bg-center
                                    bg-no-repeat
                                "
                                style={{
                                    backgroundImage: `url(${backgroundImage})`,
                                }}
                            />
                        )}

                        <div
                            className={`
                                absolute
                                inset-0
                                bg-black

                                ${
                                    backgroundImage
                                        ? 'opacity-55'
                                        : 'opacity-100'
                                }
                            `}
                        />
                    </div>

                    {/* Conteúdo */}
                    <div
                        className="
                            relative
                            z-10
                            mx-auto
                            flex
                            min-h-[calc(100vh-6rem)]
                            w-full
                            max-w-7xl
                            flex-col
                        "
                    >
                        <header
                            className="
                                flex
                                flex-1
                                flex-col
                                justify-end
                                pb-12
                                md:pb-16
                            "
                        >
                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-start
                                    justify-between
                                    gap-4
                                "
                            >
                                <h1
                                    className="
                                        min-w-0
                                        max-w-full
                                        flex-1
                                        break-words
                                        [overflow-wrap:anywhere]
                                        font-franklin
                                        text-[clamp(2.75rem,11vw,9rem)]
                                        leading-[0.86]
                                        tracking-[-0.06em]
                                    "
                                >
                                    {projectName}
                                </h1>

                                {user && (
                                    <div
                                        className="
                                            flex
                                            shrink-0
                                            flex-col
                                            items-end
                                            gap-2
                                            md:flex-row
                                        "
                                    >
                                        <EditProjectButton
                                            locale={
                                                locale as Locale
                                            }
                                            slug={
                                                project.slug
                                            }
                                        />

                                        <DeleteProjectButton
                                            locale={
                                                locale as Locale
                                            }
                                            id={project.id}
                                            slug={
                                                project.slug
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div
                                className="
                                    mt-8
                                    grid
                                    gap-8
                                    border-t
                                    border-current/30
                                    pt-5
                                    md:grid-cols-[minmax(0,1fr)_auto]
                                "
                            >
                                {description && (
                                    <p
                                        className="
                                            max-w-3xl
                                            whitespace-pre-line
                                            font-mono
                                            text-sm
                                            leading-relaxed
                                            md:text-base
                                        "
                                    >
                                        {description}
                                    </p>
                                )}

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-5
                                        font-mono
                                        text-xs
                                        uppercase
                                        tracking-[0.12em]
                                    "
                                >
                                    {project.client && (
                                        <span>
                                            {project.client}
                                        </span>
                                    )}

                                    {project.year && (
                                        <span>
                                            {project.year}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </header>

                        <Link
                            href={`/${locale}/`}
                            className="
                                inline-flex
                                w-fit
                                items-center
                                gap-3
                                py-4
                                font-mono
                                text-xs
                                uppercase
                                tracking-[0.12em]
                                transition-opacity
                                duration-300
                                hover:opacity-50
                            "
                        >
                            <span aria-hidden="true">
                                ←
                            </span>

                            <span>
                                {locale === 'pt'
                                    ? '←'
                                    : '←'}
                            </span>
                        </Link>
                    </div>

                    {/* Galeria adicional */}
                    {media.length > 1 && (
                        <section
                            className="
                                relative
                                z-10
                                mx-auto
                                mt-24
                                flex
                                w-full
                                max-w-7xl
                                flex-col
                                gap-8
                            "
                        >
                            {media
                                .filter(
                                    (mediaUrl) =>
                                        mediaUrl !==
                                        backgroundImage
                                )
                                .map(
                                    (
                                        mediaUrl,
                                        index
                                    ) => (
                                        <div
                                            key={`${mediaUrl}-${index}`}
                                            className="
                                                w-full
                                                overflow-hidden
                                            "
                                        >
                                            {isVideo(
                                                mediaUrl
                                            ) ? (
                                                <video
                                                    src={
                                                        mediaUrl
                                                    }
                                                    controls
                                                    playsInline
                                                    preload="metadata"
                                                    className="
                                                        h-auto
                                                        w-full
                                                        object-cover
                                                    "
                                                />
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={
                                                        mediaUrl
                                                    }
                                                    alt={`${projectName} ${index + 2}`}
                                                    className="
                                                        h-auto
                                                        w-full
                                                        object-cover
                                                    "
                                                />
                                            )}
                                        </div>
                                    )
                                )}
                        </section>
                    )}
                </main>
            </PageTransition>
        </PageContainer>
    )
}