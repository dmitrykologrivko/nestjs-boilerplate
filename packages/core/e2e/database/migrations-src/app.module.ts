import { Module } from '@nestjs/common';
import { CoreModule } from '../../../src/core.module';
import { DatabaseModule } from '../../../src/database/database.module';
import { DEFAULT_DATA_SOURCE_NAME } from '../../../src/database/database.constants';
import { Note } from './note.entity';
// @ts-ignore: keep this import to have migrations folder for e2e tests even if it is empty
import * as migrations from './migrations';

@Module({
    imports: [
        DatabaseModule.withEntities([Note], { cli: __dirname + '/**/*.entity{.ts,.js}' }),
        DatabaseModule.withMigrations(migrations, { cli: __dirname + '/migrations/!(index)*{.ts,.js}' }),
        CoreModule.forRoot({
            imports: [
                DatabaseModule.withOptions([
                    {
                        name: DEFAULT_DATA_SOURCE_NAME,
                        type: 'sqlite',
                        database: 'database',
                        entities: [],
                        synchronize: false,
                    }
                ]),
            ],
        }),
    ],
})
export class AppModule {}
