let cryptoIns = require('crypto')


export class CryptoService {
    algorithm = 'aes-256-ctr';
    password = cryptoIns.createHash('sha256').update(String('secret')).digest('base64').substr(0, 32);
    iv = cryptoIns.randomBytes(16);



    async encrypt(text) {
        let cipher = cryptoIns.createCipheriv(
            'aes-256-cbc', Buffer.from(this.password), this.iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return {
            iv: this.iv.toString('hex'),
            encryptedData: encrypted.toString('hex')
        };
    }


    async decrypt(text) {
        let iv = Buffer.from(text.iv, 'hex');
        let encryptedText =
            Buffer.from(text.encryptedData, 'hex');

        let decipher = cryptoIns.createDecipheriv(
            'aes-256-cbc', Buffer.from(this.password), iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

}
