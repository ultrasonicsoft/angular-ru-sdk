import { Any, Descriptor } from '@angular-ru/cdk/typings';

import { RequestType } from '../../enums/request-type';
import { EmitOptions } from '../emit-options';

export interface EnsureDecoratorOptions {
    path: string;
    type: RequestType;
    target: Any;
    descriptor: Descriptor;
    emitOptions: EmitOptions;
}
