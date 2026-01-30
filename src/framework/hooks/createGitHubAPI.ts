import { useCallback } from 'react';
import type { GitHubFile, GitHubDirectory } from '../types';

interface GitHubAPIHook {
  getFile: (path: string, signal?: AbortSignal) => Promise<GitHubFile>;
  updateFile: (path: string, content: string, sha: string, message?: string, signal?: AbortSignal) => Promise<any>;
  createFile: (path: string, content: string, message?: string, signal?: AbortSignal) => Promise<any>;
  deleteFile: (path: string, sha: string, message?: string, signal?: AbortSignal) => Promise<any>;
  listDirectory: (path?: string, signal?: AbortSignal) => Promise<GitHubDirectory[]>;
  getManifest: (appPath: string, signal?: AbortSignal) => Promise<any>;
  encodeContent: (content: string) => string;
  decodeContent: (base64Content: string) => string;
}

interface CacheStore {
  getCache: (owner: string, repo: string, path: string) => { content: string; sha: string } | null;
  setCache: (owner: string, repo: string, path: string, content: string, sha: string) => void;
  invalidateCache: (owner: string, repo: string, path: string) => void;
}

interface AuthStore {
  token: string | null;
  logout: () => void;
}

export function createGitHubAPIHook(
  authStore: AuthStore,
  cacheStore: CacheStore
) {
  return function useGitHubAPI(owner: string, repo: string): GitHubAPIHook {
    const token = authStore.token;
    const { getCache, setCache, invalidateCache } = cacheStore;
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

    const encodeContent = useCallback((content: string) => {
      return btoa(unescape(encodeURIComponent(content)));
    }, []);

    const decodeContent = useCallback((base64Content: string) => {
      return decodeURIComponent(escape(atob(base64Content)));
    }, []);

    const request = useCallback(async (path: string, options: RequestInit = {}, signal?: AbortSignal) => {
      const response = await fetch(`${baseUrl}/contents/${path}`, {
        ...options,
        signal: signal || options.signal,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authStore.logout();
          throw new Error('Authentication expired');
        }
        throw new Error(`Failed to ${options.method || 'fetch'} ${path}: ${response.statusText}`);
      }

      return response.json();
    }, [baseUrl, token]);

    const getFile = useCallback(async (path: string, signal?: AbortSignal): Promise<GitHubFile> => {
      const cached = getCache(owner, repo, path);
      if (cached) {
        return {
          content: cached.content,
          sha: cached.sha,
          path
        };
      }

      const data = await request(path, {}, signal);
      const result: GitHubFile = {
        content: decodeContent(data.content),
        sha: data.sha,
        path: data.path,
        name: data.name,
        size: data.size
      };

      setCache(owner, repo, path, result.content, result.sha);
      return result;
    }, [owner, repo, getCache, setCache, request, decodeContent]);

    const updateFile = useCallback(async (
      path: string,
      content: string,
      sha: string,
      message?: string,
      signal?: AbortSignal
    ) => {
      const result = await request(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || `Update ${path}`,
          content: encodeContent(content),
          sha
        })
      }, signal);

      invalidateCache(owner, repo, path);
      return result;
    }, [owner, repo, request, encodeContent, invalidateCache]);

    const createFile = useCallback(async (
      path: string,
      content: string,
      message?: string,
      signal?: AbortSignal
    ) => {
      return request(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || `Create ${path}`,
          content: encodeContent(content)
        })
      }, signal);
    }, [request, encodeContent]);

    const deleteFile = useCallback(async (
      path: string,
      sha: string,
      message?: string,
      signal?: AbortSignal
    ) => {
      const result = await request(path, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || `Delete ${path}`,
          sha
        })
      }, signal);

      invalidateCache(owner, repo, path);
      return result;
    }, [owner, repo, request, invalidateCache]);

    const listDirectory = useCallback(async (path: string = '', signal?: AbortSignal): Promise<GitHubDirectory[]> => {
      return request(path, {}, signal);
    }, [request]);

    const getManifest = useCallback(async (appPath: string, signal?: AbortSignal) => {
      try {
        const file = await getFile(`${appPath}/manifest.json`, signal);
        return JSON.parse(file.content);
      } catch (err: any) {
        // Don't report aborted requests as errors
        if (err.name === 'AbortError') {
          throw err;
        }
        return null;
      }
    }, [getFile]);

    return {
      getFile,
      updateFile,
      createFile,
      deleteFile,
      listDirectory,
      getManifest,
      encodeContent,
      decodeContent
    };
  };
}
