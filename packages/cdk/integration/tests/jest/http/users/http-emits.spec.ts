import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    DATA_HTTP_CLIENT_INTERCEPTOR,
    DataHttpClient,
    DataHttpClientModule,
    DefaultHttpClientInterceptor
} from '@angular-ru/cdk/http';
import { Delete, Get, Patch, Post, Put, RestClient } from '@angular-ru/cdk/http/decorators';
import { DataBeforeRequestOptions, DataHttpInterceptor } from '@angular-ru/cdk/http/typings';
import { Nullable } from '@angular-ru/cdk/typings';

describe('[TEST]: HTTP Client', () => {
    const MOCK_API: string = 'http://localhost';
    let client: Nullable<ApiEmitsClient> = null;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    @Injectable()
    @RestClient()
    class ApiEmitsClient extends DataHttpClient<MyInterceptor> {
        @Get('get')
        public getMethod() {
            return this.restTemplate();
        }

        @Put('put')
        public putMethod() {
            return this.restTemplate();
        }

        @Post('post')
        public postMethod() {
            return this.restTemplate();
        }

        @Delete('delete')
        public deleteMethod() {
            return this.restTemplate();
        }

        @Patch('patch')
        public patchMethod() {
            return this.restTemplate();
        }
    }

    @Injectable()
    class MyInterceptor extends DefaultHttpClientInterceptor implements DataHttpInterceptor {
        public events: string[] = [];

        public onBeforeRequest({ method, path, clientOptions }: DataBeforeRequestOptions): void {
            this.events.push(
                `${method.toUpperCase()}: /${path} - { emitSuccess: ${clientOptions.emitSuccess}, emitFailure: ${
                    clientOptions.emitFailure
                } }`
            );
        }
    }

    @Component({
        selector: 'any',
        template: ''
    })
    class AnyComponent {
        constructor(public readonly api: ApiEmitsClient) {}
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: DATA_HTTP_CLIENT_INTERCEPTOR,
                    useClass: MyInterceptor
                }
            ],
            declarations: [AnyComponent],
            imports: [CommonModule, HttpClientTestingModule, DataHttpClientModule.forRoot([ApiEmitsClient], {})]
        });

        TestBed.compileComponents();
        client = TestBed.inject(ApiEmitsClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('gET ({ emitSuccess: false, emitFailure: false })', () => {
        client?.getMethod().subscribe(() => {
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/get`);
        req.flush(null);

        client?.putMethod().subscribe(() => {
            expect(req.request.method).toBe('PUT');
        });

        req = httpMock.expectOne(`${MOCK_API}/put`);
        req.flush(null);

        client?.postMethod().subscribe(() => {
            expect(req.request.method).toBe('POST');
        });

        req = httpMock.expectOne(`${MOCK_API}/post`);
        req.flush(null);

        client?.patchMethod().subscribe(() => {
            expect(req.request.method).toBe('PATCH');
        });

        req = httpMock.expectOne(`${MOCK_API}/patch`);
        req.flush(null);

        client?.deleteMethod().subscribe(() => {
            expect(req.request.method).toBe('DELETE');
        });

        req = httpMock.expectOne(`${MOCK_API}/delete`);
        req.flush(null);

        expect(client?.interceptor?.events).toEqual([
            'GET: /get - { emitSuccess: false, emitFailure: true }',
            'PUT: /put - { emitSuccess: true, emitFailure: true }',
            'POST: /post - { emitSuccess: true, emitFailure: true }',
            'PATCH: /patch - { emitSuccess: true, emitFailure: true }',
            'DELETE: /delete - { emitSuccess: true, emitFailure: true }'
        ]);
    });
});
