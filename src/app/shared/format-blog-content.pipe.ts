import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatBlogContent',
  standalone: true
})
export class FormatBlogContentPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(content: string): SafeHtml {
    if (!content) return '';

    // Convert markdown-like syntax to HTML
    let formatted = content
      // Headings
      .replace(/^### (.+)$/gm, '<h3 class="text-2xl font-bold text-white mt-8 mb-4">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-bold text-white mt-10 mb-6">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-bold text-white mt-12 mb-8">$1</h1>')
      
      // Code blocks with syntax highlighting
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        // Clean up the code: normalize spacing and indentation
        const lines = code.split('\n');
        
        // Remove leading/trailing empty lines
        while (lines.length > 0 && lines[0].trim() === '') {
          lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
          lines.pop();
        }
        
        // Remove extra blank lines (keep max 1 consecutive blank line)
        const cleanedLines: string[] = [];
        let previousWasBlank = false;
        
        for (const line of lines) {
          const isBlank = line.trim() === '';
          if (isBlank) {
            if (!previousWasBlank) {
              cleanedLines.push('');
            }
            previousWasBlank = true;
          } else {
            cleanedLines.push(line);
            previousWasBlank = false;
          }
        }
        
        const cleanedCode = cleanedLines.join('\n');
        const escapedCode = cleanedCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

        const highlightedCode = this.highlightCode(cleanedCode, lang);
        const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
        const languageLabel = (lang || 'code').toUpperCase();

        return `
<div class="code-block my-10" data-code-id="${codeId}">
  <div class="rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.9)]">
    <div class="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/70 rounded-t-2xl bg-slate-900/70">
      <div class="flex items-center gap-2">
        <span class="inline-flex h-2 w-2 rounded-full bg-emerald-400/80"></span>
        <span class="text-[0.65rem] tracking-[0.4em] text-slate-400 font-semibold">${languageLabel}</span>
      </div>
      <button onclick="copyCode('${codeId}')" class="copy-btn flex items-center gap-2 px-3 py-1.5 text-[0.7rem] font-medium text-slate-300 rounded-full border border-slate-700/60 hover:text-white hover:border-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 focus-visible:ring-offset-slate-900">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span class="copy-text">Copy</span>
      </button>
    </div>
    <pre class="rounded-b-2xl bg-slate-950/90 px-4 sm:px-6 py-5 overflow-x-auto text-sm leading-7 text-slate-100 font-mono"><code id="${codeId}" class="block min-w-full whitespace-pre" data-raw="${escapedCode}">${highlightedCode}</code></pre>
  </div>
</div>`;
      })
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-blue-400 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      
      // Lists (ordered and unordered)
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6 mb-2">$1</li>')
      .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>')
      
      // Paragraphs (lines that don't start with HTML tags)
      .replace(/^(?!<[huplc]|<pre|<code|<li|<div)(.+)$/gm, '<p class="mb-4">$1</p>');

    // Wrap consecutive <li> items in <ul>
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
      if (match.includes('list-disc')) {
        return `<ul class="space-y-2 my-4">${match}</ul>`;
      }
      return `<ol class="space-y-2 my-4 list-decimal">${match}</ol>`;
    });

    return this.sanitizer.sanitize(1, formatted) || '';
  }

  private highlightCode(code: string, language?: string): string {
    // Escape HTML entities first
    code = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply syntax highlighting based on language
    if (language === 'java' || language === 'javascript' || language === 'typescript') {
      // Strings first (to avoid matching keywords inside strings)
      code = code.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, 
        '<span style="color: #a5d6a7;">"$1"</span>');
      
      // Comments
      code = code.replace(/\/\/(.*?)$/gm, 
        '<span style="color: #78909c; font-style: italic;">//$1</span>');
      code = code.replace(/\/\*([\s\S]*?)\*\//g, 
        '<span style="color: #78909c; font-style: italic;">/*$1*/</span>');
      
      // Keywords
      code = code.replace(/\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|new|return|if|else|for|while|do|switch|case|break|continue|void|try|catch|finally|throw|throws|const|let|var|function|async|await|this|super)\b/g, 
        '<span style="color: #c792ea;">$1</span>');
      
      // Annotations (Java)
      code = code.replace(/@([A-Za-z][A-Za-z0-9]*)/g, 
        '<span style="color: #ffcb6b;">@$1</span>');
      
      // Types and Classes (capitalized words)
      code = code.replace(/\b([A-Z][a-zA-Z0-9_]*)/g, 
        '<span style="color: #ffcb6b;">$1</span>');
      
      // Numbers
      code = code.replace(/\b(\d+)\b/g, 
        '<span style="color: #f78c6c;">$1</span>');
      
      // Methods and functions
      code = code.replace(/\b([a-z][a-zA-Z0-9_]*)\s*\(/g, 
        '<span style="color: #82aaff;">$1</span>(');
      
    } else if (language === 'python') {
      // Strings
      code = code.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\\]*(\\.[^"\\]*)*"|'[^'\\]*(\\.[^'\\]*)*')/g, 
        '<span style="color: #a5d6a7;">$1</span>');
      
      // Comments
      code = code.replace(/#(.*?)$/gm, 
        '<span style="color: #78909c; font-style: italic;">#$1</span>');
      
      // Keywords
      code = code.replace(/\b(def|class|import|from|return|if|else|elif|for|while|with|as|try|except|finally|lambda|yield|async|await|pass|break|continue|raise|assert|in|is|not|and|or)\b/g, 
        '<span style="color: #c792ea;">$1</span>');
      
      // Decorators
      code = code.replace(/@([a-zA-Z_][a-zA-Z0-9_]*)/g, 
        '<span style="color: #ffcb6b;">@$1</span>');
      
      // Built-in functions
      code = code.replace(/\b(print|len|range|str|int|float|list|dict|set|tuple|open|enumerate|zip|map|filter)\b/g, 
        '<span style="color: #82aaff;">$1</span>');
      
      // Classes (capitalized)
      code = code.replace(/\b([A-Z][a-zA-Z0-9_]*)/g, 
        '<span style="color: #ffcb6b;">$1</span>');
    }
    
    return code;
  }

}
