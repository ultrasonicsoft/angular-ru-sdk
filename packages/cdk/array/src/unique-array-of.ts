import { isFunctionLike } from '@angular-ru/cdk/function';
import { getValueByPath } from '@angular-ru/cdk/object';
import { Any, Nullable } from '@angular-ru/cdk/typings';
import { isNotNil } from '@angular-ru/cdk/utils';

type TrackBy<T> = (item: T) => Any;

export function uniqueArrayOf<T>(list: T[], trackBy: string | TrackBy<T>): T[] {
    const uniqueMap: Map<string, T> = new Map();

    for (const item of list) {
        let trackKey: Nullable<Any>;

        if (isFunctionLike(trackBy)) {
            trackKey = trackBy(item);
        } else {
            trackKey = getValueByPath(item, trackBy);
        }

        const isValidKey: boolean = isNotNil(trackKey) && !uniqueMap.has(trackKey);

        if (isValidKey) {
            uniqueMap.set(trackKey, item);
        }
    }

    return Array.from(uniqueMap).map(([, item]: [string, T]): T => item);
}
