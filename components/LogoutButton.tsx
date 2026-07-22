'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import type { Locale } from '@/lib/dictionaries'

type LogoutButtonProps = {
    locale: Locale
}

export default function LogoutButton({
    locale,
}: LogoutButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function handleLogout() {
        setIsLoading(true)

        const supabase = createClient()

        const { error } =
            await supabase.auth.signOut()

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
            onClick={handleLogout}
            disabled={isLoading}
            className="
                uppercase
                transition-opacity
                hover:opacity-50
                disabled:cursor-not-allowed
                disabled:opacity-40
                text-red-600
            "
        >
            {isLoading
                ? locale === 'pt'
                    ? 'Saindo...'
                    : 'Signing out...'
                : 'Logout'}
        </button>
    )
}