declare const dump: (msg: string) => void

export function print(msg: string): void {
  if (!msg.endsWith('\n')) msg += '\n'
  dump(msg)
}
