import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Component, Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DataHttpClient, DataHttpClientModule } from '@angular-ru/cdk/http';
import { Delete, Get, Patch, PathVariable, Post, Put, RestClient } from '@angular-ru/cdk/http/decorators';
import { Nullable } from '@angular-ru/cdk/typings';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

describe('[TEST]: HTTP without decorators for client', () => {
    const MOCK_API: string = 'http://localhost';
    let client: Nullable<ApiUsersClient> = null;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    interface User {
        id: number;
        name: string;
    }

    @Injectable()
    @RestClient('/users')
    class ApiUsersClient extends DataHttpClient {
        @Get('/')
        public findAllUsers(): Observable<User[]> {
            return this.restTemplate();
        }

        @Get()
        public findAllUsersWithPaginator(index: number, size: number): Observable<User[]> {
            return this.restTemplate({ queryParams: { index, size } });
        }

        @Get('/{id}')
        public findByIdUser(id: number): Observable<User> {
            return this.restTemplate({ pathVariables: { id } });
        }

        @Get('/{id}')
        public findByIdUserWithoutOverride(@PathVariable('id') _id: number, id: number): Observable<User> {
            return this.restTemplate({ pathVariables: { id } });
        }

        @Get('/')
        public getFirstUser(): Observable<User> {
            return this.restTemplate<User[]>().pipe(map((value: User[]) => value[0] as User));
        }

        @Post('/{id}')
        public createUser(id: number, body: Partial<User>): Observable<void> {
            return this.restTemplate({ body, pathVariables: { id } });
        }

        @Put('/{id}')
        public saveUser(id: number, body: User): Observable<void> {
            return this.restTemplate({ body, pathVariables: { id } });
        }

        @Delete('/{id}')
        public deleteByIdUser(id: number): Observable<void> {
            return this.restTemplate({ pathVariables: { id } });
        }

        @Patch('/{id}')
        public mutateUser(id: number, body: Partial<User>): Observable<void> {
            return this.restTemplate({ body, pathVariables: { id } });
        }
    }

    @Component({
        selector: 'events',
        template: ''
    })
    class UsersComponent {
        constructor(public readonly api: ApiUsersClient) {}
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [UsersComponent],
            imports: [CommonModule, HttpClientTestingModule, DataHttpClientModule.forRoot([ApiUsersClient])]
        });

        TestBed.compileComponents();
        client = TestBed.inject(ApiUsersClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should be correct send GET request with decorator', fakeAsync(() => {
        client?.findAllUsers().subscribe((response: User[]) => {
            expect(response).toEqual([
                { id: 1, name: 'a' },
                { id: 2, name: 'b' }
            ]);
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users`);
        req.flush([
            { id: 1, name: 'a' },
            { id: 2, name: 'b' }
        ]);

        tick(100);

        client?.getFirstUser().subscribe((response: User) => {
            expect(response).toEqual({ id: 1, name: 'a' });
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users`);
        req.flush([
            { id: 1, name: 'a' },
            { id: 2, name: 'b' }
        ]);

        tick(100);
    }));

    it('should be correct GET request with path variable', fakeAsync(() => {
        client?.findByIdUser(2).subscribe((response: User) => {
            expect(response).toEqual({ id: 2, name: 'b' });
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/2`);
        req.flush({ id: 2, name: 'b' });

        tick(100);

        client?.findByIdUser(3).subscribe((response: User) => {
            expect(response).toEqual({ id: 3, name: 'c' });
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/3`);
        req.flush({ id: 3, name: 'c' });

        tick(100);
    }));

    it('should be correct GET request with path variable without override', fakeAsync(() => {
        client?.findByIdUserWithoutOverride(10, 2).subscribe((response: User) => {
            expect(response).toEqual({ id: 2, name: 'b' });
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/2`);
        req.flush({ id: 2, name: 'b' });

        tick(100);

        client?.findByIdUserWithoutOverride(100, 3).subscribe((response: User) => {
            expect(response).toEqual({ id: 3, name: 'c' });
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/3`);
        req.flush({ id: 3, name: 'c' });

        tick(100);
    }));

    it('should be correct POST request with path variable', fakeAsync(() => {
        client?.createUser(2, { id: 2, name: 'b' }).subscribe((): void => {
            expect(req.request.body).toEqual({ id: 2, name: 'b' });
            expect(req.request.method).toBe('POST');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/2`);
        req.flush(null);

        tick(100);
    }));

    it('should be correct PUT request with path variable', fakeAsync(() => {
        client?.saveUser(1, { id: 1, name: 'a' }).subscribe((): void => {
            expect(req.request.body).toEqual({ id: 1, name: 'a' });
            expect(req.request.method).toBe('PUT');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/1`);
        req.flush(null);

        tick(100);
    }));

    it('should be correct DELETE request with path variable', fakeAsync(() => {
        client?.deleteByIdUser(3).subscribe((): void => {
            expect(req.request.method).toBe('DELETE');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/3`);
        req.flush(null);

        tick(100);
    }));

    it('should be correct PATCH request with path variable', fakeAsync(() => {
        client?.mutateUser(4, { name: 'a' }).subscribe((): void => {
            expect(req.request.body).toEqual({ name: 'a' });
            expect(req.request.method).toBe('PATCH');
        });

        req = httpMock.expectOne(`${MOCK_API}/users/4`);
        req.flush(null);

        tick(100);
    }));

    it('should be correct GET request with request params', fakeAsync(() => {
        client?.findAllUsersWithPaginator(4, 5).subscribe((): void => {
            expect(req.request.params.toString()).toBe('index=4&size=5');
            expect(req.request.method).toBe('GET');
        });

        req = httpMock.expectOne(`${MOCK_API}/users?index=4&size=5`);
        req.flush(null);

        tick(100);
    }));
});
