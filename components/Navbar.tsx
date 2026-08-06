'use client'

import Link from 'next/link'
import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import { usePathname } from 'next/navigation'

import LocaleSwitcher from '@/components/LocaleSwitcher'
import AddProjectButton from '@/components/AddProjectButton'
import LogoutButton from '@/components/LogoutButton'
import SpaceInvaderIcon from '@/components/SpaceInvaderIcon'

import {
    getDictionary,
    type Locale,
} from '@/lib/dictionaries'

import { createClient } from '@/lib/supabase/client'

const linkClass = `
    relative
    inline-block
    pb-1
    font-franklin
    uppercase

    after:absolute
    after:bottom-0
    after:left-0
    after:h-px
    after:w-full
    after:origin-left
    after:scale-x-0
    after:bg-current
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

    const supabase = useMemo(
        () => createClient(),
        []
    )

    const [isLoggedIn, setIsLoggedIn] =
        useState(false)

    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            setIsLoggedIn(Boolean(user))
        }

        loadUser()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setIsLoggedIn(Boolean(session))
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    function isActive(href: string) {
        return pathname === href
    }

    function getLinkClass(href: string) {
        return `
            ${linkClass}
            ${
                isActive(href)
                    ? 'after:scale-x-100'
                    : ''
            }
        `
    }

    return (
        <header
            className="
                fixed
                left-0
                top-0
                z-50
                w-full
                border-[#F4EEDB]/30
                text-[#F4EEDB]
            "
        >
            <nav
                className="
                    mx-auto
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-8
                    px-6
                    py-5
                    md:px-8
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-5
                        text-xs
                        md:gap-8
                        md:text-sm
                    "
                >

                    <Link
                        href={`/${locale}/sobre`}
                        className={getLinkClass(
                            `/${locale}/sobre`
                        )}
                    >
                        {dict.nav.about}
                    </Link>


                    <Link
                        href={`/${locale}/eventos`}
                        className={getLinkClass(
                            `/${locale}/eventos`
                        )}
                    >
                        {dict.nav.events}
                    </Link>

                    <Link
                        href={`/${locale}/audiovisual`}
                        className={getLinkClass(
                            `/${locale}/audiovisual`
                        )}
                    >
                        {dict.nav.audiovisual}
                    </Link>


                    <Link
                        href={`/${locale}/orcamento`}
                        className={getLinkClass(
                            `/${locale}/orcamento`
                        )}
                    >
                        {dict.nav.jewel}
                    </Link>

                    <Link
                        href={`/${locale}/space-invaders`}
                        className={`
                            ${getLinkClass(`/${locale}/space-invaders`)}
                            flex items-center justify-center
                        `}
                        aria-label="Space Invaders"
                        title="Space Invaders"
                    >
                        <SpaceInvaderIcon className="h-5 w-5" />
                    </Link>
                </div>

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        gap-5
                    "
                >
                    <LocaleSwitcher locale={locale} />

                    {isLoggedIn && (
                        <>
                            <AddProjectButton
                                locale={locale}
                            />

                            <LogoutButton
                                locale={locale}
                            />
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}