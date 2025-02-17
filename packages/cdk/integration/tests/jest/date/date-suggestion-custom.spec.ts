import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MATERIAL_SANITY_CHECKS, NativeDateModule } from '@angular/material/core';
import {
    DateSuggestionComposer,
    DateSuggestionModule,
    DefaultDateIntervalSuggestion,
    endOfDay,
    shiftDate,
    startOfDay
} from '@angular-ru/cdk/date';
import { DateIntervalDescriptor } from '@angular-ru/cdk/typings';

import { ExtendedDateIntervalSuggestion, SuggestionAddition } from './helpers/extended-date-interval-suggestion';
import { EXTENDED_STRATEGY_MAP } from './helpers/extended-strategy-map';

describe('[TEST]: Trim Input', () => {
    let composer: DateSuggestionComposer<ExtendedDateIntervalSuggestion>;
    let form: FormGroup;
    const descriptor: DateIntervalDescriptor = { dateFromKey: 'dateFrom', dateToKey: 'dateTo' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DateSuggestionModule.forRoot(EXTENDED_STRATEGY_MAP), NativeDateModule],
            providers: [{ provide: MATERIAL_SANITY_CHECKS, useValue: false }]
        }).compileComponents();

        composer = TestBed.inject(DateSuggestionComposer) as DateSuggestionComposer<ExtendedDateIntervalSuggestion>;
        form = new FormGroup({
            [descriptor.dateFromKey]: new FormControl(startOfDay(shiftDate({ days: -1 }))),
            [descriptor.dateToKey]: new FormControl(endOfDay())
        });
    });

    it('should return list of default strategies', () => {
        expect(composer.getSuggestions()).toEqual(Object.keys(EXTENDED_STRATEGY_MAP));
    });

    describe('should set date interval based on default LastFewDaysStrategy', () => {
        it('without options into shiftDate', () => {
            // @ts-ignore
            composer.getStrategy(DefaultDateIntervalSuggestion.LAST_3_DAYS).updateIntervalFor(form, descriptor);
            expect(form.getRawValue()).toEqual({
                dateFrom: startOfDay(shiftDate({ days: -2 })),
                dateTo: endOfDay()
            });
        });

        it('with options into shiftDate', () => {
            const dateFrom: Date = form.getRawValue()[descriptor.dateFromKey];

            composer.getStrategy(SuggestionAddition.TWO_DAYS_AROUND_START).updateIntervalFor(form, descriptor);
            expect(form.getRawValue()).toEqual({
                dateFrom: startOfDay(shiftDate({ days: -2 }, dateFrom)),
                dateTo: endOfDay(shiftDate({ days: 2 }, dateFrom))
            });
        });
    });
});
