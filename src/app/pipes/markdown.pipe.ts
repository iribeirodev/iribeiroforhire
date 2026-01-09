import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  async transform(value: string): Promise<SafeHtml> {
    if (!value) return '';
    // Converte Markdown para HTML
    const html = await marked.parse(value);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
