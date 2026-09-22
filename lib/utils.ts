import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Garante que caminhos de imagens locais com espaços ou caracteres especiais
 * (ex: ×, parênteses, pontos) sejam corretamente percent-encoded para uso em
 * atributos src de <img> e next/image.
 * Caminhos externos (http/https) são retornados sem modificação.
 */
export function safeImgSrc(url: string): string {
  if (!url) return url;
  // URLs externas: não modificar
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Caminho local: encode cada segmento de path individualmente
  // Preserva a barra inicial e as barras separadoras
  const parts = url.split('/');
  return parts
    .map((segment, i) => {
      // O primeiro segmento pode ser vazio (para paths que começam com /)
      if (i === 0 && segment === '') return '';
      return encodeURIComponent(segment);
    })
    .join('/');
}
