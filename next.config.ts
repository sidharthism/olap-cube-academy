import type { NextConfig } from 'next';
import path from 'node:path';

function normalizeBasePath(value: string | undefined) {
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

const staticExport = process.env.STATIC_EXPORT === '1';
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = staticExport
  ? {
      output: 'export',
      trailingSlash: true,
      basePath,
      turbopack: {
        root: path.resolve(process.cwd(), '..'),
      },
    }
  : {};

export default nextConfig;
