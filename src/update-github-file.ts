import axios from 'axios'
import { Options } from 'semantic-release'
import * as fs from 'fs'
import { DEFAULT_CHANGELOG_FILE } from './defaults'

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json'
  },
  auth: {
    username: process.env.GITHUB_USERNAME as string,
    password: process.env.GITHUB_API_TOKEN as string
  }
})

interface PublishParams extends Options {
  org: string
  repo: string
  changelogFile: string
}

interface Context {
  cwd: string
}

async function createChangelog (
  content: string,
  fileApiRoute: string
): Promise<void> {
  const creation = {
    content,
    message: 'docs: create Changelog'
  }

  await githubClient.put(fileApiRoute, creation)
}

export async function publish (
  { org, repo, changelogFile = DEFAULT_CHANGELOG_FILE }: PublishParams,
  { cwd }: Context
): Promise<void> {
  const fileRoute = `/repos/${org}/${repo}/contents/${changelogFile}`
  const newChangelog = fs.readFileSync(`${cwd}/${changelogFile}`, {
    encoding: 'utf-8'
  })

  const toBuffer = Buffer.from(newChangelog, 'utf-8')
  const content = toBuffer.toString('base64')

  try {
    const { data } = await githubClient.get(fileRoute)

    const update = {
      content,
      sha: data.sha,
      message: 'docs: update Changelog'
    }

    await githubClient.put(fileRoute, update)
  } catch (e) {
    if (e?.response?.status === 404) {
      await createChangelog(content, fileRoute)
    } else {
      throw e
    }
  }
}
