import { Pipe, PipeTransform } from '@angular/core';

interface HighlightResult {
  prefix: string;
  match: string;
  rest: string;
}

@Pipe({ name: 'highlightMatch', standalone: true })
export class HighlightMatchPipe implements PipeTransform {
  transform(name: string, search: string): HighlightResult {
    if (!search || !name) return { prefix: name, match: '', rest: '' };

    const index = name.toLowerCase().indexOf(search.toLowerCase());

    if (index === -1) return { prefix: name, match: '', rest: '' };

    return {
      prefix: name.slice(0, index),
      match: name.slice(index, index + search.length),
      rest: name.slice(index + search.length),
    };
  }
}
