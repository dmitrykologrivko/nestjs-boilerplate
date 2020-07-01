import { Expose } from 'class-transformer';

export class EntityDto<K = number> {

    @Expose()
    id: K;

}
