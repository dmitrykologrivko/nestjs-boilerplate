import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '../../../src/application/dto/base-entity.dto';

@Exclude()
export class NoteDto extends BaseEntityDto {

    @IsNotEmpty({ always: true })
    @Expose()
    note: string;

}
