'use client'

import {
    ChangeEvent,
    FormEvent,
    useState,
} from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { Locale } from '@/lib/dictionaries'

type Props = {
    locale: Locale
}


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
    category: ProjectCategory
    year: string
    description_pt: string
    description_en: string
    is_featured: boolean
    media: string
}

const initialState: FormState = {
    name_pt: '',
    name_en: '',
    slug: '',
    category: PROJECT_CATEGORIES[0],
    year: '',
    description_pt: '',
    description_en: '',
    is_featured: false,
    media: '',
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

function parseMedia(media: string) {
    return media
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
}

export default function NewProjectForm({
    locale,
}: Props) {
    const router = useRouter()
    const supabase = createClient()

    const [form, setForm] =
        useState<FormState>(initialState)

    const [isLoading, setIsLoading] =
        useState(false)

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

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault()

        setError(null)
        setIsLoading(true)

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            setError(
                locale === 'pt'
                    ? 'Você precisa estar logado.'
                    : 'You need to be logged in.'
            )

            setIsLoading(false)
            router.push(`/${locale}/login`)
            return
        }

        const slug = createSlug(form.slug)

        if (!form.name_pt.trim()) {
            setError(
                locale === 'pt'
                    ? 'O nome em português é obrigatório.'
                    : 'The Portuguese name is required.'
            )

            setIsLoading(false)
            return
        }

        if (!slug) {
            setError(
                locale === 'pt'
                    ? 'O slug é obrigatório.'
                    : 'The slug is required.'
            )

            setIsLoading(false)
            return
        }

        const { error: insertError } =
            await supabase
                .from('projects')
                .insert({
                    name_pt: form.name_pt.trim(),
                    name_en:
                        form.name_en.trim() || null,
                    slug,
                    category: form.category,
                    year:
                        form.year.trim() || null,
                    media: parseMedia(form.media),
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
            console.error(insertError)

            if (
                insertError.code === '23505'
            ) {
                setError(
                    locale === 'pt'
                        ? 'Já existe um projeto com esse slug.'
                        : 'A project with this slug already exists.'
                )
            } else {
                setError(
                    locale === 'pt'
                        ? 'Não foi possível criar o projeto.'
                        : 'The project could not be created.'
                )
            }

            setIsLoading(false)
            return
        }

        router.push(
            `/${locale}/projetos/${slug}`
        )

        router.refresh()
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
                label="Mídias"
                description="Coloque uma URL por linha."
            >
                <textarea
                    name="media"
                    value={form.media}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder={`https://...\nhttps://...`}
                    className={textareaClassName}
                />
            </Field>

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
                    className="size-4"
                />

                <span>Projeto em destaque</span>
            </label>

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
                        ? 'Criando...'
                        : 'Creating...'
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