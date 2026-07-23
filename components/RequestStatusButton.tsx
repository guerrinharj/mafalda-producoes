'use client'

import { useState, useTransition } from 'react'

import type { RequestStatus } from '@/types/database'

import { updateRequestStatus } from '@/app/[locale]/arte-e-joalheria/solicitacao/actions'

type Props = {
    requestId: string
    initialStatus: RequestStatus
    locale: string
}

const statusOrder: RequestStatus[] = [
    'new',
    'in_progress',
    'completed',
    'archived',
]

const statusLabels = {
    pt: {
        new: 'Nova',
        in_progress: 'Em andamento',
        completed: 'Concluída',
        archived: 'Arquivada',
    },
    en: {
        new: 'New',
        in_progress: 'In progress',
        completed: 'Completed',
        archived: 'Archived',
    },
}

export default function RequestStatusButton({
    requestId,
    initialStatus,
    locale,
}: Props) {
    const [status, setStatus] =
        useState<RequestStatus>(initialStatus)

    const [isPending, startTransition] = useTransition()

    const selectedLocale = locale === 'en' ? 'en' : 'pt'
    const labels = statusLabels[selectedLocale]

    function handleStatusChange() {
        const currentIndex = statusOrder.indexOf(status)

        const nextIndex =
            currentIndex === statusOrder.length - 1
                ? 0
                : currentIndex + 1

        const nextStatus = statusOrder[nextIndex]
        const previousStatus = status

        setStatus(nextStatus)

        startTransition(async () => {
            const result = await updateRequestStatus(
                requestId,
                locale,
                nextStatus
            )

            if (!result.success) {
                setStatus(previousStatus)
                alert(result.message)
            }
        })
    }

    return (
        <button
            type="button"
            onClick={handleStatusChange}
            disabled={isPending}
            title={
                locale === 'pt'
                    ? 'Clique para mudar o status'
                    : 'Click to change status'
            }
            className="
                w-fit
                border
                border-current
                bg-transparent
                px-3
                py-2
                text-xs
                uppercase
                tracking-wide
                transition-colors
                hover:bg-[#f4eedf]
                hover:text-black
                disabled:cursor-wait
                disabled:opacity-50
            "
        >
            {isPending
                ? locale === 'pt'
                    ? 'Atualizando...'
                    : 'Updating...'
                : labels[status]}
        </button>
    )
}