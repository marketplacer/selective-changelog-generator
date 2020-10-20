import axios from 'axios'
import { Options } from 'semantic-release'

// Can't be an import until https://github.com/jsarafajr/slackify-markdown/pull/15 is merged
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slackifyMarkdown = require('slackify-markdown')

interface Context {
  nextRelease?: {
    notes?: string
  }
}

async function sendToSlack (notes: string): Promise<void> {
  const { CHANGELOG_CHANNEL_URL } = process.env

  if (typeof CHANGELOG_CHANNEL_URL !== 'string') {
    throw new Error('Webhook URL not defined')
  }

  const formattedNotes = slackifyMarkdown(notes)

  const attachment = {
    fallback: formattedNotes,
    pretext: 'A new release has been made!',
    fields: [
      {
        value: formattedNotes,
        short: false
      }
    ]
  }

  await axios.post(CHANGELOG_CHANNEL_URL, { attachments: [attachment] })
}

export async function publish (
  _options: Options,
  { nextRelease }: Context
): Promise<void> {
  if (typeof nextRelease?.notes !== 'string') return

  const notesWithoutTitle = nextRelease.notes
    .split('\n')
    .slice(1)
    .join('\n')
    .trim()

  if (notesWithoutTitle.length === 0) {
    return
  }

  await sendToSlack(notesWithoutTitle)
}
