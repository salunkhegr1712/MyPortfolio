import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import * as Prism from 'prismjs';

// Import Prism languages
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; // html/xml
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';

@Pipe({
  name: 'formatBlogContent',
  standalone: true
})
export class FormatBlogContentPipe implements PipeTransform {

  private static markedConfigured = false;

  constructor(private sanitizer: DomSanitizer) {
    this.configureMarked();
  }

  private configureMarked() {
    if (FormatBlogContentPipe.markedConfigured) return;
    FormatBlogContentPipe.markedConfigured = true;

    const renderer = {
      code({ text, lang }: any) {
        const language = (lang || 'text').toLowerCase();
        const validLang = Prism.languages[language] ? language : 'text';
        
        // Highlight code
        let highlightedCode = text;
        if (Prism.languages[validLang]) {
          highlightedCode = Prism.highlight(text, Prism.languages[validLang], validLang);
        } else {
          // Manual escape if no highlighting
          highlightedCode = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
        const languageLabel = (lang || 'text').toUpperCase();
        const langClass = `language-${validLang}`;

        return `
          <div class="code-block my-8 relative group" data-code-id="${codeId}">
            <div class="rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <span class="ml-3 text-xs font-medium text-slate-400">${languageLabel}</span>
                </div>
                <button class="copy-btn group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all duration-200" data-target-id="${codeId}">
                  <svg class="w-4 h-4 text-slate-400 group-hover/btn:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span class="copy-text text-xs font-medium text-slate-400 group-hover/btn:text-emerald-400 transition-colors">Copy</span>
                </button>
              </div>
              <div class="relative">
                <pre class="!m-0 !p-6 !bg-slate-950 overflow-x-auto text-sm leading-relaxed font-mono ${langClass}"><code id="${codeId}" class="block min-w-full whitespace-pre ${langClass}">${highlightedCode}</code></pre>
              </div>
            </div>
          </div>`;
      },

      heading({ text, depth }: any) {
        const sizes: { [key: number]: string } = {
          1: 'text-4xl font-bold text-white mt-12 mb-8',
          2: 'text-3xl font-bold text-white mt-10 mb-6',
          3: 'text-2xl font-bold text-white mt-8 mb-4',
          4: 'text-xl font-bold text-white mt-6 mb-3',
          5: 'text-lg font-bold text-white mt-4 mb-2',
          6: 'text-base font-bold text-white mt-4 mb-2',
        };
        const className = sizes[depth] || sizes[6];
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h${depth} id="${id}" class="${className}">${text}</h${depth}>`;
      },

      paragraph({ text }: any) {
        if (text.startsWith('<img') && text.endsWith('>')) {
          return `<div class="my-8 flex justify-center">${text}</div>`;
        }
        return `<p class="mb-6 text-slate-300 leading-7 text-lg">${text}</p>`;
      },

      list(this: any, { items, ordered }: any) {
        const body = this.parser.parse(items);
        const tag = ordered ? 'ol' : 'ul';
        const className = ordered ? 'list-decimal' : 'list-disc';
        return `<${tag} class="${className} ml-6 mb-6 space-y-2 text-slate-300 marker:text-emerald-500">${body}</${tag}>`;
      },

      listitem({ text }: any) {
        return `<li class="pl-2">${text}</li>`;
      },

      blockquote(this: any, { tokens }: any) {
        const body = this.parser.parse(tokens);
        return `<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-6 bg-slate-900/50 italic text-slate-400 rounded-r-lg">${body}</blockquote>`;
      },

      image({ href, title, text }: any) {
        return `<img src="${href}" alt="${text}" title="${title || ''}" class="rounded-xl shadow-lg max-w-full h-auto border border-slate-800" />`;
      },

      link({ href, title, text }: any) {
        return `<a href="${href}" title="${title || ''}" class="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-400/30 hover:decoration-emerald-300 transition-colors" target="_blank" rel="noopener noreferrer">${text}</a>`;
      },

      strong({ text }: any) {
        return `<strong class="font-bold text-white">${text}</strong>`;
      },

      codespan({ text }: any) {
        return `<code class="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-sm border border-slate-700">${text}</code>`;
      }
    };

    marked.use({ renderer });
  }


  transform(content: string): SafeHtml {
    if (!content) return '';
    
    try {
      // Parse markdown to HTML
      const html = marked.parse(content, { async: false }) as string;
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return content;
    }
  }
}
