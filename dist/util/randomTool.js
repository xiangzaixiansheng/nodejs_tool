"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomLower = getRandomLower;
exports.getRandomUpper = getRandomUpper;
exports.getRandomNumber = getRandomNumber;
exports.getRandomSymbol = getRandomSymbol;
exports.createUniqueString = createUniqueString;
exports.getRandomBool = getRandomBool;
exports.getRandomFloat = getRandomFloat;
exports.getRandomInt = getRandomInt;
function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}
function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
function getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}
function getRandomSymbol() {
    const symbols = '~!@#$%^&*()_+{}":?><;.,';
    return symbols[Math.floor(Math.random() * symbols.length)];
}
function createUniqueString() {
    const timestamp = +new Date() + '';
    const randomNum = parseInt(String((1 + Math.random()) * 65536)) + '';
    return (+(randomNum + timestamp)).toString(32);
}
function getRandomBool() {
    return Math.random() >= 0.5;
}
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//# sourceMappingURL=randomTool.js.map