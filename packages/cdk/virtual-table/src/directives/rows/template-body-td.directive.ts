import { Directive, Input, Optional, TemplateRef } from '@angular/core';
import { Any, Nullable } from '@angular-ru/cdk/typings';

import { AbstractTemplateCellCommonDirective } from './abstract-template-cell-common.directive';

@Directive({ selector: 'ng-template[ngx-td]' })
export class TemplateBodyTdDirective<T> extends AbstractTemplateCellCommonDirective<T> {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('ngx-td') public type: Nullable<string> = null;

    constructor(@Optional() public template?: TemplateRef<Any>) {
        super(template);
    }
}
