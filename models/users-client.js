import { default as superagent } from 'superagent';
import url from 'url';

const URL = url.URL;
const authId = 'them';
const authCode = 'd950b890-a8fc-466b-8f47-b8b5aaf7c80c';

export default class UsersDbClient {

    static async authenticateUser(username, password) {
        const response = await UsersDbClient._post('/auth-check', { username, password });
        return response.body;
    }

    static async create(user) {
        const response = await UsersDbClient._post('/create-user', user.toJson());
        return response.body;
    }

    static async find(username) {
        const response = await UsersDbClient._get(`/find/${username}`);
        return response.body;
    }

    static async findOrCreate(user) {
        const response = await UsersDbClient._post('/find-or-create', user);
        return response.body;
    }

    static _getUserAuthServiceUrl(path) {
        const requestUrl = new URL(process.env.USER_SERVICE_URL);
        requestUrl.pathname = path;
        return requestUrl.toString();
    }

    static async _post(url, data) {
        return await superagent
                .post(UsersDbClient._getUserAuthServiceUrl(url))
                .send(data)
                .set('Content-Type', 'application/json')
                .set('accept', 'json')
                .auth(authId, authCode);
    }

    static async _get(url) {
        return await superagent
                .get(UsersDbClient._getUserAuthServiceUrl(url))
                .set('Content-Type', 'application/json')
                .set('accept', 'json')
                .auth(authId, authCode);
    }
}
