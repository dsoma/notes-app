import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const authId = 'them';
const authCode = 'd950b890-a8fc-466b-8f47-b8b5aaf7c80c';
const request = supertest(process.env.USER_API_TEST_URL);

const userData = {
    username: "test",
    password: "user-test",
    provider: "local",
    familyName: "fnu",
    givenName: "gnu",
    middleName: "",
    emails: [],
    photos: []
};

describe('[Users client]', () => {

    beforeAll(async () => {
        await request.post('/create-user')
                     .send(userData)
                     .set('Content-Type', 'application/json')
                     .set('Accept', 'application/json')
                     .auth(authId, authCode);
    });

    test('it should list created users', async () => {
        const response = await request.get('/list')
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThanOrEqual(1);

        const expectedData = { ...userData };
        delete expectedData.password;
        expectedData.id = userData.username;

        expect(response.body[response.body.length - 1]).toStrictEqual(expectedData);
    });

    test('it should find created users', async () => {
        const response = await request.get(`/find/${userData.username}`)
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Object);

        const expectedData = { ...userData };
        delete expectedData.password;
        expectedData.id = userData.username;

        expect(response.body).toStrictEqual(expectedData);
    });

    test('it should fail to find non created user', async () => {
        const response = await request.get(`/find/foobar`)
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toStrictEqual({});
    });

    test('it should find or create an user - find', async () => {
        const response = await request.post(`/find-or-create`)
                                      .send(userData)
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Object);
        const expectedData = { ...userData };
        delete expectedData.password;
        expectedData.id = userData.username;
        expect(response.body).toStrictEqual(expectedData);
    });

    test('it should find or create an user - create', async () => {
        const newUser = { ...userData };
        newUser.username = 'test-new';
        const response = await request.post(`/find-or-create`)
                                      .send(newUser)
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);
        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Object);
        const expectedData = { ...newUser };
        delete expectedData.password;
        expectedData.id = newUser.username;
        expect(response.body).toStrictEqual(expectedData);

        await request.del('/delete/test-new')
                    .set('Content-Type', 'application/json')
                    .set('Acccept', 'application/json')
                    .auth(authId, authCode);
    });

    test('it should update a user', async () => {
        const response1 = await request.get(`/find/${userData.username}`)
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);

        const updatedData = { ...response1.body };
        updatedData.familyName = 'Fnu';
        updatedData.middleName = 'Mnu';
        updatedData.givenName = 'Gnu';

        await request.post(`/update/${userData.username}`)
                     .send(updatedData)
                     .set('Content-Type', 'application/json')
                     .set('Accept', 'application/json')
                     .auth(authId, authCode);

        const response = await request.get(`/find/${userData.username}`)
                                      .set('Content-Type', 'application/json')
                                      .set('Accept', 'application/json')
                                      .auth(authId, authCode);

        expect(response.body).toBeDefined();
        expect(response.body).toBeInstanceOf(Object);

        const expectedData = { ...updatedData };
        delete updatedData.password;
        expectedData.id = updatedData.username;

        expect(response.body).toStrictEqual(expectedData);
    });

    test('it should handle deletion request of non created user', async () => {
        let response;

        try {
            response = await request.delete(`/delete/foobar`)
                                    .set('Content-Type', 'application/json')
                                    .set('Accept', 'application/json')
                                    .auth(authId, authCode);
        } catch(e) {
            return e;
        }

        expect(response).toBeDefined();
        expect(response.error).toBeDefined();
        expect(response.status).not.toEqual(200);
    });

    afterAll(async () => {
        await request.del('/delete/test')
                    .set('Content-Type', 'application/json')
                    .set('Acccept', 'application/json')
                    .auth(authId, authCode);
    });

});
