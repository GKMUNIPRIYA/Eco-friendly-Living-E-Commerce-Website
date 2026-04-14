/**
 * Shared utility to resolve relative upload paths to full backend URLs.
 * Use this for any image/video path that starts with /uploads/...
 */
const API_HOST = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    'http://localhost:3000/api'
).replace(/\/api$/, '');

export function toFullUrl(src: string | undefined): string {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return src.startsWith('/') ? `${API_HOST}${src}` : `${API_HOST}/${src}`;
}
