import { Commit, Context, Options } from 'semantic-release'

const typeTitles = {
  feat: 'Features',
  fix: 'Bug Fixes',
  perf: 'Performance Improvements',
  docs: 'Documentation',
  style: 'Code Style',
  refactor: 'Code Refactoring',
  build: 'Build Systems',
  ci: 'Continuous Integration'
}

type CommitType = keyof typeof typeTitles

interface ParsedCommit extends Commit {
  scope?: string
  type?: CommitType
}

interface FormattedCommit extends Commit {
  type: string
  scope: ''
}

const transformCommit = (desiredScope: string) => (
  commit: ParsedCommit,
  _context: Context
): FormattedCommit | undefined => {
  if (typeof commit.type === 'undefined' || commit.scope !== desiredScope) {
    return
  }

  const privateTypes: CommitType[] = ['style', 'refactor', 'build', 'ci']

  if (privateTypes.includes(commit.type)) return

  const formattedType = typeTitles[commit.type]

  return {
    ...commit,
    scope: '',
    type: formattedType
  }
}

type Plugin = string | [name: string, options: object]

interface ReleaseNotesOptionsGeneratorParams {
  branch?: string
  ci?: boolean
  dryRun?: boolean
  plugins?: Plugin[]
}

interface ScopedReleaseNotesParams extends ReleaseNotesOptionsGeneratorParams {
  changelogFile?: string
  changelogTitle?: string
  desiredScope: string
  /** Whether the release notes are publicly viewable. Redacts certain things (links, SHAs, etc.) if true. */
  isPublic?: boolean
}

export function scopedReleaseNotes ({
  branch = 'main',
  changelogFile = 'CHANGELOG.md',
  changelogTitle = 'Changelog',
  ci = false,
  desiredScope,
  dryRun = false,
  isPublic = true,
  plugins = []
}: ScopedReleaseNotesParams): Options {
  const options: Options = {
    writerOpts: { transform: transformCommit(desiredScope) },
    branches: [branch],
    tagFormat: `${desiredScope}\${version}`,
    plugins: [
      '@semantic-release/commit-analyzer',
      [
        '@semantic-release/release-notes-generator',
        {
          linkCompare: !isPublic,
          linkReferences: !isPublic
        }
      ],
      [
        '@semantic-release/changelog',
        {
          changelogFile,
          changelogTitle: `# ${changelogTitle}`
        }
      ],
      ...plugins
    ],
    ci,
    dryRun
  }

  return options
}

export function fullReleaseNotes ({
  branch = 'main',
  ci,
  dryRun,
  plugins = []
}: ReleaseNotesOptionsGeneratorParams): Options {
  return {
    branches: [branch],
    /* eslint-disable-next-line no-template-curly-in-string */
    tagFormat: 'v${version}',
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/changelog',
      ...plugins
    ],
    ci,
    dryRun
  }
}
