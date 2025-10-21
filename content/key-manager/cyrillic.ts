import tr from "@stefanstefanovski/transliterate-cyrillic";

export function macedonian(str: string): string {
  tr.locale('mk')
  return tr.transliterate(str).reverse()
}

export function serbian(str: string): string {
  tr.locale('rs')
  return tr.transliterate(str).reverse()
}

export function bulgarian(str: string): string {
  tr.locale('bg')
  return tr.transliterate(str).reverse()
}

export function russian(str: string): string {
  tr.locale('ru')
  return tr.transliterate(str).reverse()
}

export function ukranian(str: string): string {
  tr.locale('uk')
  return tr.transliterate(str).reverse()
}
