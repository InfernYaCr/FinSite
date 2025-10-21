export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | undefined | null }

function toVal(mix: ClassValue): string {
  let str = ''
  if (!mix) return str
  if (typeof mix === 'string' || typeof mix === 'number') {
    return '' + mix
  }
  if (Array.isArray(mix)) {
    for (let i = 0; i < mix.length; i++) {
      const x = toVal(mix[i])
      if (x) str += (str && ' ') + x
    }
    return str
  }
  if (typeof mix === 'object') {
    for (const k in mix) {
      if (mix[k]) str += (str && ' ') + k
    }
  }
  return str
}

export function cn(...inputs: ClassValue[]): string {
  // Basic clsx + de-dupe utility to avoid external deps.
  const classes = inputs.map(toVal).filter(Boolean).join(' ').split(/\s+/)
  const unique = Array.from(new Set(classes)).join(' ')
  return unique
}

export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
