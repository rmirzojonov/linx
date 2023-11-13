const maxIdLength = 5;
const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const random = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const generate = () => {
    let id = "";
    for (let i = 0; i < maxIdLength; i++) {
        let randomIndex = random(0, alphabet.length - 1);
        id += alphabet[randomIndex];
    }
    return id;
};

module.exports = generate;