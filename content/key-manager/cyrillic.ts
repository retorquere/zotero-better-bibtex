import CyrillicToTranslit from 'cyrillic-to-translit-js'

const uk = CyrillicToTranslit({ preset: 'uk' })
export function ukranian(str: string): string {
  return uk.transform(str)
}

const mn = CyrillicToTranslit({ preset: 'mn' })
export function mongolian(str: string): string {
  return mn.transform(str)
}

const ru = CyrillicToTranslit({ preset: 'ru' })
export function russian(str: string): string {
  return ru.transform(str)
}
