import Link from 'next/link'

import {
    getDictionary,
    type Locale,
} from '@/lib/dictionaries'

type NavbarProps = {
    locale: Locale
}

export default function Navbar({
    locale,
}: NavbarProps) {
    const dict = getDictionary(locale)

    const alternateLocale =
        locale === 'pt' ? 'en' : 'pt'

    return (
        <header className="">
            <nav className="grid grid-cols-4 items-center px-8 py-6">
                <Link
                    href={`/${locale}/eventos`}
                    className="
                    justify-self-start
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

                    hover:after:scale-x-100"
                >
                    {dict.nav.events}
                </Link>

                <Link
                    href={`/${locale}/audiovisual`}
                    className="
                    justify-self-center
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

                    hover:after:scale-x-100"
                >
                    {dict.nav.audiovisual}
                </Link>

                <Link
                    href={`/${locale}/arte-e-joalheria`}
                    className="
                    justify-self-center
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

                    hover:after:scale-x-100"
                >
                    {dict.nav.artAndJewelry}
                </Link>

                <Link
                    href={`/${locale}/sobre`}
                    className="
                    justify-self-end
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

                    hover:after:scale-x-100"
                >
                    {dict.nav.about}
                </Link>
            </nav>
        </header>
    )
}