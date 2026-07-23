'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/dictionaries'

type Props = {
    locale: Locale
    id: string
    slug: string
}

const STORAGE_BUCKET = 'project-media'

function getStoragePathFromPublicUrl(
    publicUrl: string
) {
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
    const markerIndex = publicUrl.indexOf(marker)

    if (markerIndex === -1) {
        return null
    }

    return decodeURIComponent(
        publicUrl.slice(markerIndex + marker.length)
    )
}

export default function DeleteProjectButton({
    locale,
    id,
    slug,
}: Props) {
    const router = useRouter()
    const supabase = createClient()

    const [isLoading, setIsLoading] =
        useState(false)

    async function handleDelete() {
        const confirmed = window.confirm(
            locale === 'pt'
                ? 'Tem certeza que deseja excluir este projeto?'
                : 'Are you sure you want to delete this project?'
        )

        if (!confirmed) {
            return
        }

        setIsLoading(true)

        const {
            data: project,
            error: fetchError,
        } = await supabase
            .from('projects')
            .select('media')
            .eq('id', id)
            .single()

        if (fetchError) {
            console.error(fetchError)
            setIsLoading(false)
            return
        }

        const mediaPaths =
            (project.media ?? [])
                .map(getStoragePathFromPublicUrl)
                .filter(Boolean) as string[]

        if (mediaPaths.length > 0) {
            const { error: storageError } =
                await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove(mediaPaths)

            if (storageError) {
                console.error(storageError)
            }
        }

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) {
            console.error(error)
            setIsLoading(false)
            return
        }

        router.push(`/${locale}`)
        router.refresh()
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="
                uppercase
                text-red-500
                transition-opacity
                hover:opacity-50
                disabled:cursor-not-allowed
                disabled:opacity-40
            "
        >
            {isLoading
                ? locale === 'pt'
                    ? 'Excluindo...'
                    : 'Deleting...'
                : locale === 'pt'
                  ? 'Excluir'
                  : 'Delete'}
        </button>
    )
}