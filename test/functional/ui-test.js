import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { default as bcrypt } from 'bcrypt';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

const authId = 'them';
const authCode = 'd950b890-a8fc-466b-8f47-b8b5aaf7c80c';
const request = supertest(process.env.USER_API_TEST_URL);
const saltRounds = 10;

async function hashpass(password) {
    let salt = await bcrypt.genSalt(saltRounds);
    let hashed = await bcrypt.hash(password, salt);
    return hashed;
}

const userData = {
    username: "tester",
    password: await hashpass("user-tester"),
    provider: "local",
    familyName: "fnu",
    givenName: "gnu",
    middleName: "",
    emails: [ 'fnu.gnu@test.com' ],
    photos: []
};

describe('Initialize test user', () => {
    test('it should add test user', async () => {
        await request.post('/create-user')
                     .send(userData)
                     .set('Content-Type', 'application/json')
                     .set('Acccept', 'application/json')
                     .auth(authId, authCode);
    });
});

describe('Notes UI test', () => {
    let browser;
    let page;

    async function login() {
        await page.click('a.nav-item[href="/users/login"]');
        await page.waitForSelector('form[action="/users/login"]');
        await page.type('[name=username]', "tester", { delay: 10 });
        await page.type('[name=password]', "user-tester", { delay: 10 });
        await page.keyboard.press('Enter');
        await page.waitForNavigation({
            'waitUntil': 'domcontentloaded'
        });
    }

    async function checkIsLoggedIn() {
        await page.waitForSelector('li.nav-item.dropdown');
        await page.click('li.nav-item.dropdown');
        await page.waitForSelector('a.dropdown-item[href="/users/logout"]');
    }

    async function logout() {
        await checkIsLoggedIn();
        await page.click('a.dropdown-item[href="/users/logout"]');
    }

    async function checkIsLoggedOut() {
        await page.waitForSelector('a.nav-item[href="/users/login"]');
    }

    beforeAll(async () => {
        browser = await puppeteer.launch({
            sloMo: 500,
            headless: false
        });

        page = await browser.newPage();
        await page.setViewport({width: 1200, height: 1024});
    });

    test('it should visit home page', async () => {
        await page.goto(process.env.NOTES_HOME_URL);
        await page.waitForSelector('a.nav-item[href="/users/login"]');
    });

    test('it should log in correctly', login);
    test('it should be logged in', checkIsLoggedIn);
    test('it should log out correctly', async () => { await page.click('a.dropdown-item[href="/users/logout"]'); });
    test('it should be logged out', checkIsLoggedOut);

    describe('Note creation test', () => {
        const noteContent = 'Lorem ipsum dolor sit amet';

        test('it should log in correctly', login);
        test('it should be logged in', checkIsLoggedIn);

        test('it should add note', async () => {
            await page.waitForSelector('a.nav-link[href="/notes/add"]');
            await page.click('a.nav-link[href="/notes/add"]');
            await page.waitForSelector('form[action="/notes/save"]');
            await page.type('[name=noteKey]', 'tKey', { delay: 10 });
            await page.type('[name=title]', 'TNS', { delay: 10 });
            await page.type('[name=content]', noteContent, { delay: 10 });
            await page.click('button[type="submit"]');
        });

        test('view new note', async () => {
            await page.waitForSelector('h3');
            const title = await page.$eval('h3', el => el.textContent);
            expect(title).contains('TNS');
            const content = await page.$eval('p', el => el.textContent);
            expect(content).contains(noteContent);
        });

        test('delete new note', async () => {
            await page.click('a.btn[href="/notes/destroy?key=tKey"');
            await page.waitForSelector('form[action="/notes/destroy/confirm"]');
            await page.click('button[type="submit"]');
            await page.waitForSelector('a.nav-link[href="/notes/add"]');
        });

        test('it should log out', logout);
        test('it should be logged out', checkIsLoggedOut);
    });

    describe('Negative tests', () => {
        test('should fail to log in', async () => {
            const uname = uuidv4();
            const pwd = await hashpass(uuidv4());
            await page.click('a.nav-item[href="/users/login"]');
            await page.waitForSelector('form[action="/users/login"]');
            await page.type('[name=username]', uname, { delay: 10 });
            await page.type('[name=password]', pwd, { delay: 10 });
            await page.keyboard.press('Enter');
            await page.waitForSelector('form[action="/users/login"]');
        });

        test('should fail on unknown URL', async () => {
            let page2 = await browser.newPage();
            await page2.setViewport({width: 1200, height: 1024});
            const response = await page2.goto(process.env.NOTES_HOME_URL + '/bad-unknown-url');
            expect(response.status()).toBe(404);
            expect(await page2.$eval('h1', el => el.textContent)).contains('404 Not Found');
            await page2.close();
        });
    });

    afterAll(async () => {
        await page.close();
        await browser.close();
    });
});

describe('Destroy test user', () => {
    test('it should remove test user', async () => {
        await request.delete(`/delete/${userData.username}`)
                     .set('Content-Type', 'application/json')
                     .set('Acccept', 'application/json')
                     .auth(authId, authCode);
    });
});
