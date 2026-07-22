'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import LocaleSwitcher from '@/components/LocaleSwitcher'
import AddProjectButton from '@/components/AddProjectButton'
import LogoutButton from '@/components/LogoutButton'

import {
    getDictionary,
    type Locale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/client'

const linkClass = `
    fixed
    z-50
    inline-block
    pb-1
    uppercase

    after:absolute
    after:left-0
    after:bottom-0
    after:h-px
    after:w-full
    after:origin-left
    after:scale-x-0
    after:bg-[#F4EEDB]
    after:transition-transform
    after:duration-300
    after:ease-out

    hover:after:scale-x-100
`

type NavbarProps = {
    locale: Locale
}

export default function Navbar({
    locale,
}: NavbarProps) {
    const dict = getDictionary(locale)
    const pathname = usePathname()

    const supabase = createClient()

    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            setIsLoggedIn(!!user)
        }

        loadUser()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const isActive = (href: string) => pathname === href

    return (
        <>
            <Link
                href={`/${locale}/eventos`}
                className={`${linkClass}
                    left-8
                    top-8
                    ${
                        isActive(`/${locale}/eventos`)
                            ? 'border-b border-current'
                            : ''
                    }`}
            >
                {dict.nav.events}
            </Link>

            <Link
                href={`/${locale}/audiovisual`}
                className={`${linkClass}
                    right-8
                    top-8
                    ${
                        isActive(`/${locale}/audiovisual`)
                            ? 'border-b border-current'
                            : ''
                    }`}
            >
                {dict.nav.audiovisual}
            </Link>

            <Link
                href={`/${locale}/arte-e-joalheria`}
                className={`${linkClass}
                    bottom-8
                    left-8
                    ${
                        isActive(`/${locale}/arte-e-joalheria`)
                            ? 'border-b border-current'
                            : ''
                    }`}
            >
                {dict.nav.artAndJewelry}
            </Link>

            <Link
                href={`/${locale}/sobre`}
                className={`${linkClass}
                    bottom-8
                    right-8
                    ${
                        isActive(`/${locale}/sobre`)
                            ? 'border-b border-current'
                            : ''
                    }`}
            >
                {dict.nav.about}
            </Link>

            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
                <LocaleSwitcher locale={locale} />
            </div>

            {isLoggedIn && (
                <>
                    <AddProjectButton locale={locale} />

                    <div className="fixed left-8 top-1/2 z-50 -translate-y-1/2">
                        <LogoutButton locale={locale} />
                    </div>
                </>
            )}
        </>
    )
}