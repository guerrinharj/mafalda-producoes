'use client'

import {
    ChangeEvent,
    FormEvent,
    useMemo,
    useState,
} from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/dictionaries'

const STORAGE_BUCKET = 'project-media'

const PROJECT_CATEGORIES = [
    'art_jewelry',
    'events',
    'audiovisual',
] as const

type ProjectCategory =
    (typeof PROJECT_CATEGORIES)[number]

export type EditableProject = {
    id: string
    name_pt: string
    name_en: string | null
    slug: string
    category: ProjectCategory
    year: string | null
    media: string[]
    description_pt: string | null
    description_en: string | null
    is_featured: boolean
}

type EditProjectFormProps = {
    locale: Locale
    project: EditableProject
}

type FormState = {
    name_pt: string
    name_en: string
    slug: string
    category: ProjectCategory
    year: string
    description_pt: string
    description_en: string
    is_featured: boolean
}

type UploadedMedia = {
    path: string
    publicUrl: string
}

function createSlug(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function sanitizeFileName(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf('.')

    const extension =
        lastDotIndex >= 0
            ? fileName.slice(lastDotIndex).toLowerCase()
            : ''

    const nameWithoutExtension =
        lastDotIndex >= 0
            ? fileName.slice(0, lastDotIndex)
            : fileName

    const sanitizedName = nameWithoutExtension
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

    return `${sanitizedName || 'media'}${extension}`
}

function formatFileSize(size: number) {
    if (size < 1024) {
        return `${size} B`
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function isVideoUrl(url: string) {
    const cleanUrl = url.split('?')[0].toLowerCase()

    return [
        '.mp4',
        '.webm',
        '.mov',
        '.m4v',
        '.avi',
    ].some((extension) =>
        cleanUrl.endsWith(extension)
    )
}

function getStoragePathFromPublicUrl(
    publicUrl: string
) {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
    const markerIndex = publicUrl.indexOf(marker)

    if (markerIndex === -1) {
        return null
    }

    const encodedPath = publicUrl.slice(
        markerIndex + marker.length
    )

    try {
        return decodeURIComponent(encodedPath)
    } catch {
        return encodedPath
    }
}

export default function EditProjectForm({
    locale,
    project,
}: EditProjectFormProps) {
    const router = useRouter()

    const supabase = useMemo(
        () => createClient(),
        []
    )

    const [form, setForm] = useState<FormState>({
        name_pt: project.name_pt,
        name_en: project.name_en ?? '',
        slug: project.slug,
        category: project.category,
        year: project.year ?? '',
        description_pt:
            project.description_pt ?? '',
        description_en:
            project.description_en ?? '',
        is_featured: project.is_featured,
    })

    const [existingMedia, setExistingMedia] =
        useState<string[]>(project.media ?? [])

    const [removedMedia, setRemovedMedia] =
        useState<string[]>([])

    const [newMediaFiles, setNewMediaFiles] =
        useState<File[]>([])

    const [isLoading, setIsLoading] =
        useState(false)

    const [uploadProgress, setUploadProgress] =
        useState<string | null>(null)

    const [error, setError] =
        useState<string | null>(null)

    function handleInputChange(
        event: ChangeEvent<
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
        >
    ) {
        const {
            name,
            value,
            type,
        } = event.target

        const checked =
            event.target instanceof HTMLInputElement
                ? event.target.checked
                : false

        setForm((currentForm) => ({
            ...currentForm,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }))
    }

    function handleNewMediaChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const selectedFiles = Array.from(
            event.target.files ?? []
        )

        const invalidFiles = selectedFiles.filter(
            (file) =>
                !file.type.startsWith('image/') &&
                !file.type.startsWith('video/')
        )

        if (invalidFiles.length > 0) {
            setError(
                locale === 'pt'
                    ? 'Selecione somente imagens e vídeos.'
                    : 'Select images and videos only.'
            )

            event.target.value = ''
            return
        }

        setError(null)

        setNewMediaFiles((currentFiles) => [
            ...currentFiles,
            ...selectedFiles,
        ])

        event.target.value = ''
    }

    function removeExistingMedia(mediaUrl: string) {
        setExistingMedia((currentMedia) =>
            currentMedia.filter(
                (item) => item !== mediaUrl
            )
        )

        setRemovedMedia((currentMedia) => [
            ...currentMedia,
            mediaUrl,
        ])
    }

    function restoreExistingMedia(mediaUrl: string) {
        setRemovedMedia((currentMedia) =>
            currentMedia.filter(
                (item) => item !== mediaUrl
            )
        )

        setExistingMedia((currentMedia) => [
            ...currentMedia,
            mediaUrl,
        ])
    }

    function removeNewMediaFile(
        indexToRemove: number
    ) {
        setNewMediaFiles((currentFiles) =>
            currentFiles.filter(
                (_, index) => index !== indexToRemove
            )
        )
    }

    async function uploadNewMedia(
        slug: string
    ): Promise<UploadedMedia[]> {
        const uploadedMedia: UploadedMedia[] = []

        for (
            let index = 0;
            index < newMediaFiles.length;
            index += 1
        ) {
            const file = newMediaFiles[index]

            setUploadProgress(
                locale === 'pt'
                    ? `Enviando ${index + 1} de ${newMediaFiles.length}: ${file.name}`
                    : `Uploading ${index + 1} of ${newMediaFiles.length}: ${file.name}`
            )

            const safeFileName =
                sanitizeFileName(file.name)

            const storagePath = [
                slug,
                `${crypto.randomUUID()}-${safeFileName}`,
            ].join('/')

            const {
                error: uploadError,
            } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, file, {
                    cacheControl: '3600',
                    contentType:
                        file.type ||
                        'application/octet-stream',
                    upsert: false,
                })

            if (uploadError) {
                throw new Error(
                    `${file.name}: ${uploadError.message}`
                )
            }

            const {
                data: publicUrlData,
            } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(storagePath)

            uploadedMedia.push({
                path: storagePath,
                publicUrl:
                    publicUrlData.publicUrl,
            })
        }

        return uploadedMedia
    }

    async function removeStoragePaths(
        paths: string[]
    ) {
        if (paths.length === 0) {
            return
        }

        const { error: removeError } =
            await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(paths)

        if (removeError) {
            throw new Error(removeError.message)
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setError(null)
        setUploadProgress(null)
        setIsLoading(true)

        let newUploads: UploadedMedia[] = []

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError || !user) {
                router.push(`/${locale}/login`)
                router.refresh()
                return
            }

            const slug = createSlug(form.slug)

            if (!form.name_pt.trim()) {
                throw new Error(
                    locale === 'pt'
                        ? 'O nome em português é obrigatório.'
                        : 'The Portuguese name is required.'
                )
            }

            if (!slug) {
                throw new Error(
                    locale === 'pt'
                        ? 'O slug é obrigatório.'
                        : 'The slug is required.'
                )
            }

            const finalMediaCount =
                existingMedia.length +
                newMediaFiles.length

            if (finalMediaCount === 0) {
                throw new Error(
                    locale === 'pt'
                        ? 'O projeto precisa ter pelo menos uma imagem ou vídeo.'
                        : 'The project must have at least one image or video.'
                )
            }

            newUploads =
                await uploadNewMedia(slug)

            const newMediaUrls = newUploads.map(
                (item) => item.publicUrl
            )

            const finalMediaUrls = [
                ...existingMedia,
                ...newMediaUrls,
            ]

            const {
                error: updateError,
            } = await supabase
                .from('projects')
                .update({
                    name_pt:
                        form.name_pt.trim(),
                    name_en:
                        form.name_en.trim() ||
                        null,
                    slug,
                    category: form.category,
                    year:
                        form.year.trim() || null,
                    media: finalMediaUrls,
                    description_pt:
                        form.description_pt.trim() ||
                        null,
                    description_en:
                        form.description_en.trim() ||
                        null,
                    is_featured:
                        form.is_featured,
                })
                .eq('id', project.id)

            if (updateError) {
                if (updateError.code === '23505') {
                    throw new Error(
                        locale === 'pt'
                            ? 'Já existe um projeto com esse slug.'
                            : 'A project with this slug already exists.'
                    )
                }

                throw new Error(
                    locale === 'pt'
                        ? `Não foi possível atualizar o projeto: ${updateError.message}`
                        : `The project could not be updated: ${updateError.message}`
                )
            }

            const removedStoragePaths =
                removedMedia
                    .map(getStoragePathFromPublicUrl)
                    .filter(
                        (
                            path
                        ): path is string => Boolean(path)
                    )

            if (removedStoragePaths.length > 0) {
                try {
                    await removeStoragePaths(
                        removedStoragePaths
                    )
                } catch (removeError) {
                    console.error(
                        'O projeto foi atualizado, mas algumas mídias antigas não foram removidas:',
                        removeError
                    )
                }
            }

            setUploadProgress(null)

            router.push(
                `/${locale}/projetos/${slug}`
            )

            router.refresh()
        } catch (submitError) {
            const uploadedPaths = newUploads.map(
                (item) => item.path
            )

            if (uploadedPaths.length > 0) {
                try {
                    await removeStoragePaths(
                        uploadedPaths
                    )
                } catch (cleanupError) {
                    console.error(
                        'Erro ao limpar novos uploads:',
                        cleanupError
                    )
                }
            }

            setError(
                submitError instanceof Error
                    ? submitError.message
                    : locale === 'pt'
                      ? 'Ocorreu um erro inesperado.'
                      : 'An unexpected error occurred.'
            )
        } finally {
            setIsLoading(false)
            setUploadProgress(null)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="
                mx-auto
                flex
                w-full
                max-w-4xl
                flex-col
                gap-10
            "
        >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Field label="Nome em português">
                    <input
                        name="name_pt"
                        type="text"
                        value={form.name_pt}
                        onChange={handleInputChange}
                        required
                        className={inputClassName}
                    />
                </Field>

                <Field label="Nome em inglês">
                    <input
                        name="name_en"
                        type="text"
                        value={form.name_en}
                        onChange={handleInputChange}
                        className={inputClassName}
                    />
                </Field>
            </div>

            <Field label="Slug">
                <input
                    name="slug"
                    type="text"
                    value={form.slug}
                    onChange={handleInputChange}
                    required
                    className={inputClassName}
                />
            </Field>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Field label="Categoria">
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        required
                        className={inputClassName}
                    >
                        {PROJECT_CATEGORIES.map(
                            (category) => (
                                <option
                                    key={category}
                                    value={category}
                                    className="text-black"
                                >
                                    {category}
                                </option>
                            )
                        )}
                    </select>
                </Field>

                <Field label="Ano">
                    <input
                        name="year"
                        type="text"
                        value={form.year}
                        onChange={handleInputChange}
                        placeholder="2026"
                        className={inputClassName}
                    />
                </Field>
            </div>

            <Field label="Descrição em português">
                <textarea
                    name="description_pt"
                    value={form.description_pt}
                    onChange={handleInputChange}
                    rows={7}
                    className={textareaClassName}
                />
            </Field>

            <Field label="Descrição em inglês">
                <textarea
                    name="description_en"
                    value={form.description_en}
                    onChange={handleInputChange}
                    rows={7}
                    className={textareaClassName}
                />
            </Field>

            {existingMedia.length > 0 && (
                <section className="flex flex-col gap-4">
                    <h2 className="text-sm">
                        {locale === 'pt'
                            ? 'Mídias atuais'
                            : 'Current media'}
                    </h2>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            md:grid-cols-3
                        "
                    >
                        {existingMedia.map(
                            (mediaUrl) => (
                                <MediaPreview
                                    key={mediaUrl}
                                    mediaUrl={mediaUrl}
                                    onRemove={() =>
                                        removeExistingMedia(
                                            mediaUrl
                                        )
                                    }
                                    disabled={isLoading}
                                    locale={locale}
                                />
                            )
                        )}
                    </div>
                </section>
            )}

            {removedMedia.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-sm text-red-500">
                        {locale === 'pt'
                            ? 'Mídias que serão removidas'
                            : 'Media to be removed'}
                    </h2>

                    {removedMedia.map(
                        (mediaUrl) => (
                            <div
                                key={mediaUrl}
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                    border-b
                                    border-red-500
                                    py-3
                                "
                            >
                                <p className="truncate text-xs opacity-60">
                                    {mediaUrl}
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        restoreExistingMedia(
                                            mediaUrl
                                        )
                                    }
                                    disabled={isLoading}
                                    className="
                                        shrink-0
                                        text-xs
                                        uppercase
                                        transition-opacity
                                        hover:opacity-50
                                    "
                                >
                                    {locale === 'pt'
                                        ? 'Desfazer'
                                        : 'Undo'}
                                </button>
                            </div>
                        )
                    )}
                </section>
            )}

            <Field
                label={
                    locale === 'pt'
                        ? 'Adicionar imagens e vídeos'
                        : 'Add images and videos'
                }
                description={
                    locale === 'pt'
                        ? 'Você pode selecionar vários arquivos.'
                        : 'You can select multiple files.'
                }
            >
                <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleNewMediaChange}
                    disabled={isLoading}
                    className="
                        w-full
                        cursor-pointer
                        border
                        border-current
                        p-4
                        file:mr-4
                        file:cursor-pointer
                        file:border
                        file:border-current
                        file:bg-transparent
                        file:px-4
                        file:py-2
                        file:text-current
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                    "
                />
            </Field>

            {newMediaFiles.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-sm">
                        {locale === 'pt'
                            ? 'Novos arquivos'
                            : 'New files'}
                    </h2>

                    <ul className="flex flex-col gap-2">
                        {newMediaFiles.map(
                            (file, index) => (
                                <li
                                    key={`${file.name}-${file.lastModified}-${index}`}
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        border-b
                                        border-current
                                        py-3
                                    "
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm">
                                            {file.name}
                                        </p>

                                        <p className="text-xs opacity-50">
                                            {file.type ||
                                                'Arquivo'}{' '}
                                            ·{' '}
                                            {formatFileSize(
                                                file.size
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeNewMediaFile(
                                                index
                                            )
                                        }
                                        disabled={isLoading}
                                        className="
                                            shrink-0
                                            text-xs
                                            uppercase
                                            text-red-500
                                            transition-opacity
                                            hover:opacity-50
                                            disabled:opacity-40
                                        "
                                    >
                                        {locale === 'pt'
                                            ? 'Remover'
                                            : 'Remove'}
                                    </button>
                                </li>
                            )
                        )}
                    </ul>
                </section>
            )}

            <label
                className="
                    flex
                    w-fit
                    cursor-pointer
                    items-center
                    gap-3
                "
            >
                <input
                    name="is_featured"
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="size-4"
                />

                <span>
                    {locale === 'pt'
                        ? 'Projeto em destaque'
                        : 'Featured project'}
                </span>
            </label>

            {uploadProgress && (
                <p className="text-sm">
                    {uploadProgress}
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="text-sm text-red-500"
                >
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="
                    w-fit
                    border
                    border-current
                    px-8
                    py-4
                    transition-colors
                    hover:bg-[#f3eddf]
                    hover:text-black
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                "
            >
                {isLoading
                    ? locale === 'pt'
                        ? 'Salvando...'
                        : 'Saving...'
                    : locale === 'pt'
                      ? 'Salvar alterações'
                      : 'Save changes'}
            </button>
        </form>
    )
}

type MediaPreviewProps = {
    mediaUrl: string
    locale: Locale
    disabled: boolean
    onRemove: () => void
}

function MediaPreview({
    mediaUrl,
    locale,
    disabled,
    onRemove,
}: MediaPreviewProps) {
    return (
        <article className="flex flex-col gap-3">
            <div
                className="
                    aspect-video
                    w-full
                    overflow-hidden
                    border
                    border-current
                    bg-black
                "
            >
                {isVideoUrl(mediaUrl) ? (
                    <video
                        src={mediaUrl}
                        controls
                        preload="metadata"
                        className="
                            h-full
                            w-full
                            object-cover
                        "
                    />
                ) : (
                    // Usamos img porque as URLs do Storage podem
                    // ainda não estar configuradas no next.config.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mediaUrl}
                        alt=""
                        className="
                            h-full
                            w-full
                            object-cover
                        "
                    />
                )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="
                    w-fit
                    text-xs
                    uppercase
                    text-red-500
                    transition-opacity
                    hover:opacity-50
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                "
            >
                {locale === 'pt'
                    ? 'Remover'
                    : 'Remove'}
            </button>
        </article>
    )
}

type FieldProps = {
    label: string
    description?: string
    children: React.ReactNode
}

function Field({
    label,
    description,
    children,
}: FieldProps) {
    return (
        <label className="flex flex-col gap-3">
            <span className="text-sm">
                {label}
            </span>

            {description && (
                <span className="text-xs opacity-50">
                    {description}
                </span>
            )}

            {children}
        </label>
    )
}

const inputClassName = `
    w-full
    border-b
    border-current
    bg-transparent
    px-0
    py-3
    outline-none
    transition-opacity
    focus:opacity-60
`

const textareaClassName = `
    w-full
    resize-y
    border
    border-current
    bg-transparent
    p-4
    outline-none
    transition-opacity
    focus:opacity-60
`