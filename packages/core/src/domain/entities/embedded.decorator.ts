import { Column } from 'typeorm';
import { ColumnEmbeddedOptions } from 'typeorm/decorator/options/ColumnEmbeddedOptions';

export function Embedded(type: (type?: any) => Function, options?: ColumnEmbeddedOptions) {
    return Column(type, options);
}
