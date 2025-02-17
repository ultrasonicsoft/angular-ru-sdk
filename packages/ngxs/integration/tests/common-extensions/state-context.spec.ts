import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Any } from '@angular-ru/cdk/typings';
import { NgxsDataPluginModule } from '@angular-ru/ngxs';
import { StateRepository } from '@angular-ru/ngxs/decorators';
import { buildDefaultsGraph, ensureStateMetadata, getStateMetadata } from '@angular-ru/ngxs/internals';
import { NgxsImmutableDataRepository } from '@angular-ru/ngxs/repositories';
import { NgxsModule, State, Store } from '@ngxs/store';
import { MetaDataModel, SharedSelectorOptions } from '@ngxs/store/src/internal/internals';
import { isObservable } from 'rxjs';

describe('[TEST]: Utils', () => {
    it('build-defaults-graph', () => {
        class ClassicClass {}

        expect(buildDefaultsGraph(ClassicClass)).toEqual({});

        @State({ name: 'helloState' })
        @Injectable()
        class HelloState {}

        expect(buildDefaultsGraph(HelloState)).toEqual({});

        @State({
            name: 'worldState',
            defaults: {
                hello: { world: true }
            }
        })
        @Injectable()
        class WorldState {}

        expect(buildDefaultsGraph(WorldState)).toEqual({ hello: { world: true } });

        @State({
            name: 'coolState',
            defaults: { cool: 'yep' },
            children: [WorldState]
        })
        @Injectable()
        class CoolState {}

        expect(buildDefaultsGraph(CoolState)).toEqual({ cool: 'yep', worldState: { hello: { world: true } } });

        let message: string | null = null;

        try {
            class B {}

            class C {}

            @State({
                name: 'a',
                defaults: {},
                children: [B, C]
            })
            @Injectable()
            class A {}

            buildDefaultsGraph(A);
        } catch (e: unknown) {
            message = (e as Error).message;
        }

        expect(message).toBe('State name not provided in class');

        @State({
            name: 'f',
            defaults: []
        })
        @Injectable()
        class F {}

        @State({
            name: 'e',
            defaults: []
        })
        @Injectable()
        class E {}

        @State({
            name: 'd',
            defaults: {},
            children: [E, F]
        })
        @Injectable()
        class D {}

        expect(buildDefaultsGraph(D)).toEqual({ e: [], f: [] });

        message = null;

        try {
            @State({
                name: 'G',
                defaults: [],
                children: [E, F]
            })
            @Injectable()
            class G {}

            buildDefaultsGraph(G);
        } catch (e: unknown) {
            message = (e as Error).message;
        }

        expect(message).toBe('Child states can only be added to an object. Cannot convert Array to PlainObject');
    });

    it('should be create singleton context', () => {
        @StateRepository()
        @State({
            name: 'myState',
            defaults: 'any'
        })
        @Injectable()
        class MyState extends NgxsImmutableDataRepository<string> {}

        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([MyState]), NgxsDataPluginModule.forRoot()]
        });

        const state: MyState = TestBed.inject(MyState);
        const store: Store = TestBed.inject(Store);

        expect(state.getState()).toEqual(new MyState().getState());

        new MyState().setState('hello');

        expect(state.getState()).toBe('hello');
        expect(store.snapshot()).toEqual({ myState: 'hello' });
    });

    it('should be correct ensure state metadata', () => {
        class MyState {}

        const meta: MetaDataModel = ensureStateMetadata(MyState);

        expect(meta).toEqual({
            name: null,
            actions: {},
            defaults: {},
            path: null,
            makeRootSelector: expect.any(Function),
            children: []
        });

        expect(
            meta.makeRootSelector!({
                getSelectorOptions(localOptions?: SharedSelectorOptions): SharedSelectorOptions {
                    return localOptions as Any;
                },
                getStateGetter(_key: Any): (state: Any) => Any {
                    // selector
                    return (state) => state;
                }
            })({ hello: 'world' })
        ).toEqual({ hello: 'world' });
    });

    it('should be correct get state metadata', () => {
        @StateRepository()
        @State({
            name: 'app',
            defaults: [1, 2, 3]
        })
        @Injectable()
        class AppState extends NgxsImmutableDataRepository<number> {}

        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([AppState]), NgxsDataPluginModule.forRoot()]
        });

        const state: AppState = TestBed.inject(AppState);
        const store: Store = TestBed.inject(Store);
        const meta: MetaDataModel = getStateMetadata(AppState);

        expect(isObservable(state.state$)).toBe(true);
        expect(meta).toEqual({
            name: 'app',
            actions: {},
            defaults: [1, 2, 3],
            path: 'app',
            makeRootSelector: expect.any(Function),
            children: undefined
        });

        expect(
            meta.makeRootSelector!({
                getSelectorOptions(localOptions?: SharedSelectorOptions): SharedSelectorOptions {
                    return localOptions as Any;
                },
                getStateGetter(key: Any): (state: Any) => Any {
                    // selector
                    return (_state: Any) => _state[key];
                }
            })(store.snapshot())
        ).toEqual([1, 2, 3]);
    });
});
