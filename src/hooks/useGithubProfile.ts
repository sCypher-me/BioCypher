import { useEffect, useState } from "react"
import { profile, type GithubRepositorySnapshot, type GithubSnapshot } from "../data/profile"

export type GithubDataSource = "loading" | "live" | "cached" | "mixed" | "fallback"

export type GithubUser = {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
}

export type GithubRepository = {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
  updated_at: string
}

type GithubCache = {
  data: GithubSnapshot
  source: Exclude<GithubDataSource, "loading" | "cached">
  cachedAt: number
}

type GithubProfileState = {
  data: GithubSnapshot
  source: GithubDataSource
}

const API_ROOT = "https://api.github.com"
const TRUSTED_HOSTS = new Set(["github.com", "avatars.githubusercontent.com", "user-images.githubusercontent.com"])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isSafeUrl(value: unknown) {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" && TRUSTED_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

function isGithubUser(value: unknown): value is GithubUser {
  if (!isRecord(value)) return false
  return typeof value.login === "string"
    && (value.name === null || typeof value.name === "string")
    && (value.bio === null || typeof value.bio === "string")
    && isSafeUrl(value.avatar_url)
    && isSafeUrl(value.html_url)
    && [value.public_repos, value.followers, value.following].every((entry) => typeof entry === "number" && Number.isFinite(entry) && entry >= 0)
}

function isGithubRepository(value: unknown): value is GithubRepository {
  if (!isRecord(value)) return false
  return typeof value.name === "string"
    && (value.description === null || typeof value.description === "string")
    && isSafeUrl(value.html_url)
    && (value.language === null || typeof value.language === "string")
    && typeof value.stargazers_count === "number"
    && typeof value.forks_count === "number"
    && typeof value.pushed_at === "string"
    && typeof value.updated_at === "string"
}

function isRepositorySnapshot(value: unknown): value is GithubRepositorySnapshot {
  if (!isRecord(value)) return false
  return typeof value.name === "string"
    && typeof value.description === "string"
    && isSafeUrl(value.url)
    && (value.language === null || typeof value.language === "string")
    && typeof value.stars === "number"
    && typeof value.forks === "number"
    && typeof value.pushedAt === "string"
}

function isSnapshot(value: unknown): value is GithubSnapshot {
  if (!isRecord(value)) return false
  return typeof value.login === "string"
    && typeof value.name === "string"
    && typeof value.bio === "string"
    && (value.avatarUrl === profile.media.photo.fallback || isSafeUrl(value.avatarUrl))
    && isSafeUrl(value.htmlUrl)
    && [value.publicRepos, value.followers, value.following, value.totalStars].every((entry) => typeof entry === "number" && Number.isFinite(entry) && entry >= 0)
    && Array.isArray(value.languages)
    && value.languages.every((entry) => typeof entry === "string")
    && (value.featuredRepository === null || isRepositorySnapshot(value.featuredRepository))
}

function isCache(value: unknown): value is GithubCache {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<GithubCache>
  return Boolean(isSnapshot(candidate.data) && typeof candidate.cachedAt === "number")
}

async function request(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`)
  return response.json() as Promise<unknown>
}

function summarizeRepositories(repositories: GithubRepository[]) {
  const languages = new Map<string, number>()
  let totalStars = 0

  repositories.forEach((repository) => {
    totalStars += repository.stargazers_count
    if (repository.language) languages.set(repository.language, (languages.get(repository.language) ?? 0) + 1)
  })

  const featured = [...repositories].sort((a, b) =>
    b.stargazers_count - a.stargazers_count || Date.parse(b.updated_at) - Date.parse(a.updated_at),
  )[0]

  const featuredRepository: GithubRepositorySnapshot | null = featured ? {
    name: featured.name,
    description: featured.description ?? profile.ui.github.noDescription,
    url: featured.html_url,
    language: featured.language,
    stars: featured.stargazers_count,
    forks: featured.forks_count,
    pushedAt: featured.pushed_at,
  } : null

  return {
    totalStars,
    languages: [...languages.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([language]) => language),
    featuredRepository,
  }
}

export function useGithubProfile(): GithubProfileState {
  const [state, setState] = useState<GithubProfileState>({
    data: profile.github.snapshot,
    source: "loading",
  })

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(profile.github.cacheKey)
      if (stored) {
        const cached: unknown = JSON.parse(stored)
        if (isCache(cached)) {
          setState({ data: cached.data, source: "cached" })
          return
        }
      }
    } catch {
      window.sessionStorage.removeItem(profile.github.cacheKey)
    }

    const controller = new AbortController()
    const username = encodeURIComponent(profile.github.username)

    void Promise.allSettled([
      request(`${API_ROOT}/users/${username}`, controller.signal),
      request(`${API_ROOT}/users/${username}/repos?type=owner&sort=updated&per_page=100`, controller.signal),
    ]).then(([userResult, repositoryResult]) => {
      if (controller.signal.aborted) return

      const user = userResult.status === "fulfilled" && isGithubUser(userResult.value) ? userResult.value : null
      const repositories = repositoryResult.status === "fulfilled" && Array.isArray(repositoryResult.value)
        ? repositoryResult.value.filter(isGithubRepository).slice(0, 100)
        : null
      const repositorySummary = repositories ? summarizeRepositories(repositories) : null

      const data: GithubSnapshot = {
        ...profile.github.snapshot,
        ...(user ? {
          login: user.login,
          name: user.name?.trim() || profile.github.snapshot.name,
          bio: user.bio?.trim() || profile.bio,
          avatarUrl: user.avatar_url,
          htmlUrl: user.html_url,
          publicRepos: user.public_repos,
          followers: user.followers,
          following: user.following,
        } : {}),
        ...(repositorySummary ? {
          publicRepos: user?.public_repos ?? repositories?.length ?? profile.github.snapshot.publicRepos,
          ...repositorySummary,
        } : {}),
      }

      const source: GithubDataSource = user && repositories ? "live" : user || repositories ? "mixed" : "fallback"
      setState({ data, source })

      if (source !== "fallback") {
        const cache: GithubCache = { data, source, cachedAt: Date.now() }
        try {
          window.sessionStorage.setItem(profile.github.cacheKey, JSON.stringify(cache))
        } catch {
          // The dossier still works when storage is unavailable.
        }
      }
    })

    return () => controller.abort()
  }, [])

  return state
}
