import { Any } from '@angular-ru/common/typings';

declare const document: Any;

export function copyBuffer(str: string): void {
    const firstIndex: number = 0;
    const el: HTMLTextAreaElement = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected: Range | false =
        document?.getSelection()?.rangeCount > firstIndex ? document?.getSelection().getRangeAt(firstIndex) : false;

    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
        document?.getSelection()?.removeAllRanges();
        document?.getSelection()?.addRange(selected);
    }
}
