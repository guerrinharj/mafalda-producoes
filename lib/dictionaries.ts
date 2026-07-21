import { notFound } from 'next/navigation'

import { dictionary as enDictionary } from '@/dictionaries/en'
import { dictionary as ptDictionary } from '@/dictionaries/pt'

export const locales = ['pt', 'en'] as const

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
    return locales.includes(value as Locale)
}

export function getDictionary(locale: Locale) {
    if (locale === 'pt') {
        return ptDictionary
    }

    if (locale === 'en') {
        return enDictionary
    }

    notFound()
}