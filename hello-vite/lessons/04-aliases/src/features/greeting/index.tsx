// Imported through the @lib alias (a resolve.alias entry)
import { shout } from '@lib/shout'

export function Greeting({ name }: { name: string }) {
  return <h1>{shout(`hello ${name}`)}</h1>
}
