import { ToolDefinition, StudioId } from '../types';
import { getToolById, getToolsByStudio } from '../data/webRegistry';

export const SITE_URL =
  (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : (import.meta.env.VITE_SITE_URL || 'https://toolstrum.vercel.app');

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getToolSlug = (tool: ToolDefinition): string => {
  return `${tool.id}-${slugify(tool.name)}`;
};

export const getToolUrl = (tool: ToolDefinition): string => {
  return `/tool/${getToolSlug(tool)}`;
};

export const getStudioUrl = (studioId: StudioId): string => {
  return `/studio/${studioId}`;
};

export interface ParsedRoute {
  type: 'home' | 'studio' | 'tool';
  studioId: StudioId | null;
  toolId: number | null;
}

export const parseCurrentRoute = (): ParsedRoute => {
  if (typeof window === 'undefined') {
    return { type: 'home', studioId: null, toolId: null };
  }

  const path = window.location.pathname.replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { type: 'home', studioId: null, toolId: null };
  }

  if (segments[0] === 'studio' && segments[1]) {
    const studioId = segments[1] as StudioId;
    return { type: 'studio', studioId, toolId: null };
  }

  if (segments[0] === 'tool' && segments[1]) {
    const rawId = segments[1].split('-')[0];
    const toolId = parseInt(rawId, 10);
    if (!isNaN(toolId)) {
      const tool = getToolById(toolId);
      if (tool) {
        return { type: 'tool', studioId: tool.studioId, toolId: tool.id };
      }
    }
  }

  return { type: 'home', studioId: null, toolId: null };
};

export const updateBrowserHistory = (studioId: StudioId | null, toolId: number | null) => {
  if (typeof window === 'undefined') return;

  let targetPath = '/';
  if (toolId !== null) {
    const tool = getToolById(toolId);
    if (tool) {
      targetPath = getToolUrl(tool);
    } else {
      targetPath = `/tool/${toolId}`;
    }
  } else if (studioId !== null) {
    targetPath = getStudioUrl(studioId);
  }

  if (window.location.pathname !== targetPath) {
    window.history.pushState({ studioId, toolId }, '', targetPath);
  }
};

export const updatePageMeta = (
  title: string,
  description: string,
  path: string = '/'
) => {
  if (typeof document === 'undefined') return;

  // Title
  document.title = title;

  // Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  const fullUrl = `${SITE_URL}${path}`;
  canonical.setAttribute('href', fullUrl);

  // Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // Open Graph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // Open Graph URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', fullUrl);
};
