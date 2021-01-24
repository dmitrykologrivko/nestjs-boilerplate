import { Column } from 'typeorm';
import { ColumnEmbeddedOptions } from 'typeorm/decorator/options/ColumnEmbeddedOptions';

export function Embedded(type: Function, options?: ColumnEmbeddedOptions) {
    return Column(() => type, options);
}
