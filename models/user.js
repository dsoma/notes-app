
export default class User {
    constructor (aUser) {
        this.provider   = aUser.provider || '';
        this.username   = aUser.username || '';
        this.password   = aUser.password || '';
        this.familyName = aUser.familyName || '';
        this.middleName = aUser.middleName || '';
        this.givenName  = aUser.givenName  || '';
        this.emails     = aUser.emails || [];
        this.photos     = aUser.photos || [];
    }

    toJson() {
        return {
            provider: this.provider,
            username: this.username,
            password: this.password,
            familyName: this.familyName,
            middleName: this.middleName,
            givenName: this.givenName,
            emails: this.emails,
            photos: this.photos
        };
    }
}
