import { Injectable } from '@angular/core';
import { Any, Immutable } from '@angular-ru/cdk/typings';
import { StateRepository } from '@angular-ru/ngxs/decorators';
import { NgxsDataRepository, NgxsImmutableDataRepository } from '@angular-ru/ngxs/repositories';
import { ngxsTestingPlatform } from '@angular-ru/ngxs/testing';
import { NgxsDataAfterReset, NgxsDataDoCheck } from '@angular-ru/ngxs/typings';
import { NgxsSimpleChange, State, Store } from '@ngxs/store';

describe('[TEST]: Abstract ngxs data repository', () => {
    let event: string[] = [];

    interface Model {
        value: number;
    }

    @StateRepository()
    @State({
        name: 'a',
        defaults: { value: 1 }
    })
    @Injectable()
    class A extends NgxsDataRepository<Model> implements NgxsDataDoCheck, NgxsDataAfterReset {
        constructor() {
            super();
            event.push(`create: ${this.name}`);
        }

        public ngxsOnInit(): void {
            event.push(`ngxsOnInit: ${this.name}`);
            super.ngxsOnInit();
        }

        public ngxsOnChanges(change: NgxsSimpleChange): void {
            event.push(`ngxsOnChanges: ${this.name} -> ${JSON.stringify(change)}`);
            super.ngxsOnChanges();
        }

        public ngxsAfterBootstrap(): void {
            event.push(`ngxsAfterBootstrap: ${this.name}`);
            super.ngxsAfterBootstrap();
        }

        public ngxsDataDoCheck(): void {
            event.push(`ngxsDataDoCheck: ${this.name}`);
        }

        public ngxsDataAfterReset(): void {
            event.push(`ngxsDataAfterReset: ${this.name}`);
        }
    }

    @StateRepository()
    @State({
        name: 'b',
        defaults: { value: 1 }
    })
    @Injectable()
    class B extends NgxsImmutableDataRepository<Model> implements NgxsDataDoCheck, NgxsDataAfterReset {
        constructor() {
            super();
            event.push(`create: ${this.name}`);
        }

        public ngxsOnInit(): void {
            event.push(`ngxsOnInit: ${this.name}`);
            super.ngxsOnInit();
        }

        public ngxsOnChanges(change: NgxsSimpleChange): void {
            event.push(`ngxsOnChanges: ${this.name} -> ${JSON.stringify(change)}`);
            super.ngxsOnChanges();
        }

        public ngxsAfterBootstrap(): void {
            event.push(`ngxsAfterBootstrap: ${this.name}`);
            super.ngxsAfterBootstrap();
        }

        public ngxsDataDoCheck(): void {
            event.push(`ngxsDataDoCheck: ${this.name}`);
        }

        public ngxsDataAfterReset(): void {
            event.push(`ngxsDataAfterReset: ${this.name}`);
        }
    }

    beforeEach(() => {
        event = [];
    });

    it(
        'should be ngxs data repository',
        ngxsTestingPlatform([A], (store: Store, a: A) => {
            expect(store.snapshot()).toStrictEqual({ a: { value: 1 } });

            expect(a.isInitialised).toBe(true);
            expect(a.isBootstrapped).toBe(true);

            a.state$.subscribe((e: Model) => event.push(`state(${a.name}): set value - ${e.value}`));

            expect(a.name).toBe('a');

            a.setState({ value: 2 });
            expect(a.getState()).toStrictEqual({ value: 2 });

            a.initialState.value = 5; // not affected
            a.reset();

            expect(a.getState()).toStrictEqual({ value: 1 });

            a.setState({ value: 3 });
            a.setState({ value: 4 });
            a.setState({ value: 5 });

            a.reset();

            store.reset({ a: { value: 10 } });

            expect(a.getState()).toEqual({ value: 10 });

            expect(event).toEqual([
                'create: a',
                'ngxsOnChanges: a -> {"currentValue":{"value":1},"firstChange":true}',
                'ngxsOnInit: a',
                'ngxsAfterBootstrap: a',
                'ngxsDataDoCheck: a',
                'state(a): set value - 1',
                'ngxsOnChanges: a -> {"previousValue":{"value":1},"currentValue":{"value":2},"firstChange":false}',
                'state(a): set value - 2',
                'ngxsOnChanges: a -> {"previousValue":{"value":2},"currentValue":{"value":1},"firstChange":false}',
                'state(a): set value - 1',
                'ngxsDataAfterReset: a',
                'ngxsOnChanges: a -> {"previousValue":{"value":1},"currentValue":{"value":3},"firstChange":false}',
                'ngxsDataDoCheck: a',
                'state(a): set value - 3',
                'ngxsOnChanges: a -> {"previousValue":{"value":3},"currentValue":{"value":4},"firstChange":false}',
                'state(a): set value - 4',
                'ngxsOnChanges: a -> {"previousValue":{"value":4},"currentValue":{"value":5},"firstChange":false}',
                'state(a): set value - 5',
                'ngxsOnChanges: a -> {"previousValue":{"value":5},"currentValue":{"value":1},"firstChange":false}',
                'state(a): set value - 1',
                'ngxsDataAfterReset: a',
                'state(a): set value - 10'
            ]);
        })
    );

    it(
        'should be ngxs data immutable repository',
        ngxsTestingPlatform({ states: [B] }, (store: Store, b: B) => {
            expect(b.isInitialised).toBe(true);
            expect(b.isBootstrapped).toBe(true);

            b.state$.subscribe((e: Immutable<Model>) => event.push(`state(${b.name}): set value - ${e.value}`));

            expect(b.name).toBe('b');

            b.setState({ value: 2 });
            expect(b.getState()).toEqual({ value: 2 });

            (b.initialState as Any).value = 5; // not affected
            b.reset();

            expect(b.getState()).toEqual({ value: 1 });

            b.setState({ value: 3 });
            b.setState({ value: 4 });
            b.setState({ value: 5 });

            b.reset();

            store.reset({ b: { value: 10 } });

            expect(b.getState()).toEqual({ value: 10 });

            expect(event).toEqual([
                'create: b',
                'ngxsOnChanges: b -> {"currentValue":{"value":1},"firstChange":true}',
                'ngxsOnInit: b',
                'ngxsAfterBootstrap: b',
                'ngxsDataDoCheck: b',
                'state(b): set value - 1',
                'ngxsOnChanges: b -> {"previousValue":{"value":1},"currentValue":{"value":2},"firstChange":false}',
                'state(b): set value - 2',
                'ngxsOnChanges: b -> {"previousValue":{"value":2},"currentValue":{"value":1},"firstChange":false}',
                'state(b): set value - 1',
                'ngxsDataAfterReset: b',
                'ngxsOnChanges: b -> {"previousValue":{"value":1},"currentValue":{"value":3},"firstChange":false}',
                'ngxsDataDoCheck: b',
                'state(b): set value - 3',
                'ngxsOnChanges: b -> {"previousValue":{"value":3},"currentValue":{"value":4},"firstChange":false}',
                'state(b): set value - 4',
                'ngxsOnChanges: b -> {"previousValue":{"value":4},"currentValue":{"value":5},"firstChange":false}',
                'state(b): set value - 5',
                'ngxsOnChanges: b -> {"previousValue":{"value":5},"currentValue":{"value":1},"firstChange":false}',
                'state(b): set value - 1',
                'ngxsDataAfterReset: b',
                'state(b): set value - 10'
            ]);
        })
    );
});
