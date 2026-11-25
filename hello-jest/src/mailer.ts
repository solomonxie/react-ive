// Small modules used by lesson 04.
export type Sender = (to: string, body: string) => Promise<void>

export async function sendWelcome(send: Sender, email: string) {
  await send(email, `Welcome, ${email}!`)
}
