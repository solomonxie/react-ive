import { now } from './clock'

export function greeting(name: string): string {
  const hour = new Date(now()).getUTCHours()
  return hour < 12 ? `Good morning, ${name}` : `Good afternoon, ${name}`
}
