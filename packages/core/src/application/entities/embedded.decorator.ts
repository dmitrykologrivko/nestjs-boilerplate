import { Column } from 'typeorm';
import { ColumnEmbeddedOptions } from 'typeorm/decorator/options/ColumnEmbeddedOptions';
import { TFunction } from '../../utils/type.utils';

export function Embedded(type: (type?: any) => TFunction, options?: ColumnEmbeddedOptions) {
    return Column(type, options);
}
