import Link from 'next/link'
import LocaleSwitcher from '@/components/LocaleSwitcher'

import {
    getDictionary,
    type Locale,
} from '@/lib/dictionaries'

type NavbarProps = {
    locale: Locale
}

const linkClass = `
    relative
    inline-block
    pb-1

    after:absolute
    after:left-0
    after:bottom-0
    after:h-px
    after:w-full
    after:origin-left
    after:scale-x-0
    after:bg-black
    after:transition-transform
    after:duration-300
    after:ease-out

    hover:after:scale-x-100
`

export default function Navbar({
    locale,
}: NavbarProps) {
    const dict = getDictionary(locale)

    return (
        <>
            <header
                className="
                    fixed
                    top-0
                    left-0
                    z-50
                    w-full
                    bg-white/90
                    backdrop-blur-sm
                "
            >
                <nav className="grid grid-cols-4 items-center px-8 py-6">
                    <Link
                        href={`/${locale}/eventos`}
                        className={`${linkClass} justify-self-start`}
                    >
                        {dict.nav.events}
                    </Link>

                    <Link
                        href={`/${locale}/audiovisual`}
                        className={`${linkClass} justify-self-start`}
                    >
                        {dict.nav.audiovisual}
                    </Link>

                    <Link
                        href={`/${locale}/arte-e-joalheria`}
                        className={`${linkClass} justify-self-end`}
                    >
                        {dict.nav.artAndJewelry}
                    </Link>

                    <Link
                        href={`/${locale}/sobre`}
                        className={`${linkClass} justify-self-end`}
                    >
                        {dict.nav.about}
                    </Link>
                </nav>
            </header>

            <div className="fixed bottom-8 right-8 z-50">
                <LocaleSwitcher locale={locale} />
            </div>
        </>
    )
}