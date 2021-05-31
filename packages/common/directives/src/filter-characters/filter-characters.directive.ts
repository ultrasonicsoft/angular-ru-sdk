import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueInterceptor, ControlValueInterceptorDescriptor } from '@angular-ru/common/forms';
import { filter } from '@angular-ru/common/string';

@Directive({
    selector: '[filterCharacters]',
    providers: [ControlValueInterceptor]
})
export class FilterCharactersDirective implements OnInit, OnDestroy {
    @Input() public filterCharacters: string[] = [];
    public preparedValue: string = '';

    private controlValueOperator: ControlValueInterceptorDescriptor = {
        toModelValue: (value: string): string => {
            this.preparedValue = filter(value, this.filterCharacters);
            return this.preparedValue;
        }
    };

    constructor(
        private readonly interceptor: ControlValueInterceptor,
        private readonly elementRef: ElementRef<HTMLInputElement>
    ) {}

    public ngOnInit(): void {
        this.interceptor.attach(this.controlValueOperator);
    }

    public ngOnDestroy(): void {
        this.interceptor.detach(this.controlValueOperator);
    }

    @HostListener('input', ['$event'])
    public onInput(): void {
        this.elementRef.nativeElement.value = this.preparedValue;
    }
}
