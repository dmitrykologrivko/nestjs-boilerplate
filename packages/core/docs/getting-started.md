# Getting started

To get started, you can scaffold the project with the [Nest CLI](https://docs.nestjs.com/cli/overview).

```shell
$ npm i -g @nestjs/cli
$ nest new project-name
```

Then install NestJS Boilerplate core package and required peer dependencies.

```shell
$ npm i --save @nestjs-boilerplate/core @nestjs/config @nestjs/typeorm typeorm class-validator class-transformer
```

Now you can integrate NestJS Boilerplate into the project. Let's create a first entity.

```typescript
import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, BaseEntity } from '@nestjs-boilerplate/core';

@Entity()
export class Note extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    note: string;

}
```

Create a DTO (Data Transfer Object) to abstract between data and presentation layers.

```typescript
import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { BaseEntityDto } from '@nestjs-boilerplate/core';

@Exclude()
export class NoteDto extends BaseEntityDto {

    @IsNotEmpty({ always: true })
    @Expose()
    note: string;

}
```

Create a simple CRUD service for the entity.

```typescript
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';

@Injectable()
export class NoteService extends BaseCrudService<Note, NoteDto> {
    constructor(
        protected dataSource: DataSource,
    ) {
        super(
            dataSource,
            {
                entityCls: Note,
                listOutputCls: NoteDto,
                retrieveOutputCls: NoteDto,
                createPayloadCls: NoteDto,
                createOutputCls: NoteDto,
                updatePayloadCls: NoteDto,
                updateOutputCls: NoteDto,
            },
        );
    }
}
```

Create a CRUD controller and inject entity CRUD service.

```typescript
import { CrudController, ApiController } from '@nestjs-boilerplate/core';
import { NoteService } from './note.service';
import { NoteDto } from './note.dto';

@ApiController('notes')
export class NoteController extends CrudController<NoteDto> {
    constructor(
        private noteService: NoteService,
    ) {
        super(noteService);
    }
}
```

It is time to register all created components in the application module.

```typescript
import { Module } from '@nestjs/common';
import { CoreModule, DatabaseModule } from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';

@Module({
    imports: [
        CoreModule.forRoot(),
        DatabaseModule.withEntities([Note]),
    ],
    providers: [NoteService],
    controllers: [NoteController],
})
export class AppModule {}
```

Finally, you need to bootstrap and start your application in the main project file.

```typescript
import { Bootstrap } from '@nestjs-boilerplate/core';
import { AppModule } from './app.module';

async function bootstrap() {
    await new Bootstrap(AppModule).startApplication();
}

bootstrap().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
```

Congratulations! 🥳 NestJS Boilerplate is started on the `localhost:8000`, now you can do the API requests to
`/api/notes/`.