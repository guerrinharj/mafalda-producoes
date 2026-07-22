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

export default function Navbar({
    locale,
}: NavbarProps) {
    const dict = getDictionary(locale)

    return (
        <>
            <Link
                href={`/${locale}/eventos`}
                className={`${linkClass} left-8 top-8`}
            >
                {dict.nav.events}
            </Link>

            <Link
                href={`/${locale}/audiovisual`}
                className={`${linkClass} right-8 top-8`}
            >
                {dict.nav.audiovisual}
            </Link>

            <Link
                href={`/${locale}/arte-e-joalheria`}
                className={`${linkClass} bottom-8 left-8`}
            >
                {dict.nav.artAndJewelry}
            </Link>

            <Link
                href={`/${locale}/sobre`}
                className={`${linkClass} bottom-8 right-8`}
            >
                {dict.nav.about}
            </Link>

            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
                <LocaleSwitcher locale={locale} />
            </div>
        </>
    )
}