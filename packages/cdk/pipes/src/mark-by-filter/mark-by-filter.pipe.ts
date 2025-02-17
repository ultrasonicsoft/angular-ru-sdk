import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ensureRegexp, isRegexpStr } from '@angular-ru/cdk/regexp';
import { toStringVal } from '@angular-ru/cdk/string';
import { Any, Nullable } from '@angular-ru/cdk/typings';
import { isNotNil } from '@angular-ru/cdk/utils';

import { MarkedValue } from './marked-value';

@Pipe({ name: 'markByFilter' })
export class MarkByFilterPipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer) {}

    public transform(value: Nullable<string>, filter?: Nullable<string>, color: string = '#ffdd2d'): MarkedValue {
        return isNotNil(filter) ? this.search(value, filter, color) : value;
    }

    private search(value: Nullable<string>, filter?: Nullable<string>, color?: string): SafeHtml {
        const existFilter: boolean = isNotNil(value) && isNotNil(filter);
        let newString: Nullable<string> = value;

        if (existFilter) {
            newString = this.highLightingString(toStringVal(value), toStringVal(filter), color);
        }

        return this.sanitizer.bypassSecurityTrustHtml(newString as Any);
    }

    private highLightingString(value: string, filter: string, color?: string): string {
        let newString: string;
        let filterValue: string = filter;

        try {
            filterValue = filterValue.replace(/\s/g, '&nbsp;');

            const regexp: RegExp = isRegexpStr(filterValue)
                ? new RegExp(ensureRegexp(filterValue), 'ig')
                : new RegExp(filterValue, 'i');

            newString = value
                ?.toString()
                ?.replace(/\s/g, '&nbsp;')
                ?.replace(regexp, (founded: string): string => `<span style="background: ${color}">${founded}</span>`);
        } catch {
            newString = value;
        }

        return newString;
    }
}
