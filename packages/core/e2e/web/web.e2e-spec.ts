import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Bootstrap } from '../../src/bootstrap/bootstrap.util';
import { Note } from './src/note.entity';
import { AppModule } from './src/app.module';

describe('Web (e2e)', () => {
    const PORT = 65535;
    let app: INestApplication;
    let dataSource: DataSource;

    async function initNotes() {
        const notes = [
            {
                note: 'First Note'
            },
            {
                note: 'Second Note'
            },
            {
                note: 'Third Note'
            },
        ];
        await dataSource.getRepository(Note).save(notes);
    }

    async function clearNotes() {
        await dataSource.getRepository(Note).clear();
    }

    beforeAll(async () => {
        app = await new Bootstrap(AppModule)
            .startApplication({ port: PORT });
        dataSource = app.get(DataSource);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearNotes();
        await initNotes();
    });

    afterEach(async () => {
        await clearNotes();
    });

    it('app should be defined', async () => {
        expect(app).toBeDefined();
    });

    it('should return list of notes', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/notes')
            .expect(200);

        const {
            count,
            results,
            next,
            previous
        } = response.body;

        expect(count).toBe(3);
        expect(next).toBeNull();
        expect(previous).toBeNull();
        expect(results.length).toBe(3);
        expect(results[0].note).toBe('First Note');
        expect(results[1].note).toBe('Second Note');
        expect(results[2].note).toBe('Third Note');
    });

    it('should return list of paginated notes', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/notes?page=1&limit=1')
            .expect(200);

        const {
            count,
            results,
            next,
            previous
        } = response.body;

        expect(count).toBe(3);
        expect(next).toBeDefined();
        expect(previous).toBeNull();
        expect(results.length).toBe(1);
        expect(results[0].note).toBe('First Note');
    });

    it('should return list of found notes', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/notes?search=First')
            .expect(200);

        const {
            count,
            results,
            next,
            previous
        } = response.body;

        expect(count).toBe(1);
        expect(next).toBeNull();
        expect(previous).toBeNull();
        expect(results.length).toBe(1);
        expect(results[0].note).toBe('First Note');
    });

    it('should return list of filtered notes', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/notes?where=note__eq=First%20Note')
            .expect(200);

        const {
            count,
            results,
            next,
            previous
        } = response.body;

        expect(count).toBe(1);
        expect(next).toBeNull();
        expect(previous).toBeNull();
        expect(results.length).toBe(1);
        expect(results[0].note).toBe('First Note');
    });

    it('should return list of filtered notes when several filters applied', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/notes?where=note__starts=T&where=note__ends=e')
            .expect(200);

        const {
            count,
            results,
            next,
            previous
        } = response.body;

        expect(count).toBe(1);
        expect(next).toBeNull();
        expect(previous).toBeNull();
        expect(results.length).toBe(1);
        expect(results[0].note).toBe('Third Note');
    });

    it('should return a note', async () => {
        const note = (await dataSource.getRepository(Note).find({}))[0];

        const response = await request(app.getHttpServer())
            .get(`/api/notes/${note.id}`)
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(note.id);
        expect(response.body.note).toBe(note.note);
    });

    it('should return not found error', async () => {
        await clearNotes();

        const response = await request(app.getHttpServer())
            .get('/api/notes/1')
            .expect(404);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found'
        });
    });

    it('should return forbidden error', async () => {
        const note = await dataSource.getRepository(Note).save({
            note: 'Forbidden Note'
        });

        const response = await request(app.getHttpServer())
            .get(`/api/notes/${note.id}`)
            .expect(403);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied'
        });
    });

    it('should create a note', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/notes')
            .send({
                note: 'New Note'
            })
            .expect(201);

        expect(response.body).toBeDefined();
        expect(response.body.id).toBeDefined();
        expect(response.body.note).toBe('New Note');
    });

    it('should return validation error', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/notes')
            .send({
                note: ''
            })
            .expect(400);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 400,
            error: 'Bad Request',
            message: [
                {
                    property: 'note',
                    value: '',
                    constraints: {
                        isNotEmpty: 'note should not be empty'
                    },
                    children: []
                }
            ]
        });
    });

    it('should update a note', async () => {
        const note = (await dataSource.getRepository(Note).find({}))[0];

        const response = await request(app.getHttpServer())
            .put(`/api/notes/${note.id}`)
            .send({
                note: 'Updated Note'
            })
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(note.id);
        expect(response.body.note).toBe('Updated Note');
    });

    it('should return not found error on update', async () => {
        await clearNotes();

        const response = await request(app.getHttpServer())
            .put('/api/notes/1')
            .send({
                note: 'Updated Note'
            })
            .expect(404);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found'
        });
    });

    it('should return forbidden error on update', async () => {
        const note = await dataSource.getRepository(Note).save({
            note: 'Forbidden Note'
        });

        const response = await request(app.getHttpServer())
            .put(`/api/notes/${note.id}`)
            .send({
                note: 'Updated Note'
            })
            .expect(403);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied'
        });
    });

    it('should partial update a note', async () => {
        const note = (await dataSource.getRepository(Note).find({}))[0];

        const response = await request(app.getHttpServer())
            .patch(`/api/notes/${note.id}`)
            .send({
                note: 'Updated Note'
            })
            .expect(200);

        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(note.id);
        expect(response.body.note).toBe('Updated Note');
    });

    it('should return not found error on partial update', async () => {
        await clearNotes();

        const response = await request(app.getHttpServer())
            .patch('/api/notes/1')
            .send({
                note: 'Updated Note'
            })
            .expect(404);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found'
        });
    });

    it('should return forbidden error on partial update', async () => {
        const note = await dataSource.getRepository(Note).save({
            note: 'Forbidden Note'
        });

        const response = await request(app.getHttpServer())
            .patch(`/api/notes/${note.id}`)
            .send({
                note: 'Updated Note'
            })
            .expect(403);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied'
        });
    });

    it('should delete a note', async () => {
        const note = (await dataSource.getRepository(Note).find({}))[0];

        const response = await request(app.getHttpServer())
            .delete(`/api/notes/${note.id}`)
            .expect(204);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({});
    });

    it('should return not found error on delete', async () => {
        await clearNotes();

        const response = await request(app.getHttpServer())
            .delete('/api/notes/1')
            .expect(404);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found'
        });
    });

    it('should return forbidden error on delete', async () => {
        const note = await dataSource.getRepository(Note).save({
            note: 'Forbidden Note'
        });

        const response = await request(app.getHttpServer())
            .delete(`/api/notes/${note.id}`)
            .expect(403);

        expect(response.body).toBeDefined();
        expect(response.body).toStrictEqual({
            statusCode: 403,
            error: 'Permission Denied',
            message: 'Permission Denied'
        });
    });
});
