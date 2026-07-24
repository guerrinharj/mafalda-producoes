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

type Props = {
    locale: Locale
}

const STORAGE_BUCKET = 'project-media'

const PROJECT_CATEGORIES = [
    'art_jewelry',
    'events',
    'audiovisual',
] as const

type ProjectCategory =
    (typeof PROJECT_CATEGORIES)[number]

type FormState = {
    name_pt: string
    name_en: string
    slug: string
    client: string
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

const initialState: FormState = {
    name_pt: '',
    name_en: '',
    slug: '',
    client: '',
    category: PROJECT_CATEGORIES[0],
    year: '',
    description_pt: '',
    description_en: '',
    is_featured: false,
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

export default function NewProjectForm({
    locale,
}: Props) {
    const router = useRouter()

    const supabase = useMemo(
        () => createClient(),
        []
    )

    const [form, setForm] =
        useState<FormState>(initialState)

    const [mediaFiles, setMediaFiles] =
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

    function handleNameChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const namePt = event.target.value

        setForm((currentForm) => ({
            ...currentForm,
            name_pt: namePt,
            slug: createSlug(namePt),
        }))
    }

    function handleMediaChange(
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
        setMediaFiles(selectedFiles)
    }

    function removeMediaFile(indexToRemove: number) {
        setMediaFiles((currentFiles) =>
            currentFiles.filter(
                (_, index) => index !== indexToRemove
            )
        )
    }

    async function uploadMediaFiles(
        slug: string
    ): Promise<UploadedMedia[]> {
        const uploadedMedia: UploadedMedia[] = []

        for (
            let index = 0;
            index < mediaFiles.length;
            index += 1
        ) {
            const file = mediaFiles[index]

            setUploadProgress(
                locale === 'pt'
                    ? `Enviando ${index + 1} de ${mediaFiles.length}: ${file.name}`
                    : `Uploading ${index + 1} of ${mediaFiles.length}: ${file.name}`
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

    async function removeUploadedFiles(
        uploadedMedia: UploadedMedia[]
    ) {
        if (uploadedMedia.length === 0) {
            return
        }

        const paths = uploadedMedia.map(
            (item) => item.path
        )

        const { error: removeError } =
            await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(paths)

        if (removeError) {
            console.error(
                'Erro ao remover uploads:',
                removeError
            )
        }
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setError(null)
        setUploadProgress(null)
        setIsLoading(true)

        let uploadedMedia: UploadedMedia[] = []

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

            if (mediaFiles.length === 0) {
                throw new Error(
                    locale === 'pt'
                        ? 'Adicione pelo menos uma imagem ou vídeo.'
                        : 'Add at least one image or video.'
                )
            }

            uploadedMedia =
                await uploadMediaFiles(slug)

            const mediaUrls = uploadedMedia.map(
                (item) => item.publicUrl
            )

            const {
                error: insertError,
            } = await supabase
                .from('projects')
                .insert({
                    name_pt:
                        form.name_pt.trim(),
                    name_en:
                        form.name_en.trim() ||
                        null,
                    slug,
                    category: form.category,
                    year:
                        form.year.trim() || null,
                    media: mediaUrls,
                    description_pt:
                        form.description_pt.trim() ||
                        null,
                    description_en:
                        form.description_en.trim() ||
                        null,
                    is_featured:
                        form.is_featured,
                })

            if (insertError) {
                if (insertError.code === '23505') {
                    throw new Error(
                        locale === 'pt'
                            ? 'Já existe um projeto com esse slug.'
                            : 'A project with this slug already exists.'
                    )
                }

                throw new Error(
                    locale === 'pt'
                        ? `Não foi possível criar o projeto: ${insertError.message}`
                        : `The project could not be created: ${insertError.message}`
                )
            }

            setUploadProgress(null)

            router.push(
                `/${locale}/projetos/${slug}`
            )

            router.refresh()
        } catch (submitError) {
            await removeUploadedFiles(
                uploadedMedia
            )

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
                        onChange={handleNameChange}
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

            <Field label="Cliente">
                <input
                    name="client"
                    type="text"
                    value={form.client}
                    onChange={handleInputChange}
                    required
                    className={inputClassName}
                />
            </Field>

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

            <Field
                label={
                    locale === 'pt'
                        ? 'Imagens e vídeos'
                        : 'Images and videos'
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
                    onChange={handleMediaChange}
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

            {mediaFiles.length > 0 && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm">
                        {locale === 'pt'
                            ? `${mediaFiles.length} arquivo(s) selecionado(s)`
                            : `${mediaFiles.length} file(s) selected`}
                    </p>

                    <ul className="flex flex-col gap-2">
                        {mediaFiles.map(
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
                                            removeMediaFile(
                                                index
                                            )
                                        }
                                        disabled={
                                            isLoading
                                        }
                                        className="
                                            shrink-0
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
                                </li>
                            )
                        )}
                    </ul>
                </div>
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
                        ? 'Enviando...'
                        : 'Uploading...'
                    : locale === 'pt'
                        ? 'Criar projeto'
                        : 'Create project'}
            </button>
        </form>
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