# Getting started

To get started, you can scaffold the project with the [Nest CLI](https://docs.nestjs.com/cli/overview).

```shell
$ npm i -g @nestjs/cli
$ nest new project-name
```

Then install NestJS Boilerplate core package and required peer dependencies.

```shell
$ npm i --save @nestjs-boilerplate/core typeorm class-validator class-transformer
```

Now you can integrate NestJS Boilerplate into the project. Let's create a first entity.

```typescript
import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, BaseEntity } from '@nestjs-boilerplate/core';

@Entity()
export class Note implements BaseEntity {

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
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseCrudService, InjectRepository } from '@nestjs-boilerplate/core';
import { Note } from './note.entity';
import { NoteDto } from './note.dto';

@Injectable()
export class NoteService extends BaseCrudService<Note, NoteDto> {
    constructor(
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
    ) {
        super(
            noteRepository,
            {
                entityCls: Note,
                dtoCls: NoteDto,
                createInputCls: NoteDto,
                updateInputCls: NoteDto,
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

new Bootstrap(AppModule)
    .startApplication();
```

Congratulations! 🥳 NestJS Boilerplate is started on the `localhost:8000`, now you can do the API requests to
`/api/notes/`.