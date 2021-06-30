"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomInt = exports.getRandomFloat = exports.getRandomBool = exports.createUniqueString = exports.getRandomSymbol = exports.getRandomNumber = exports.getRandomUpper = exports.getRandomLower = void 0;
function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}
exports.getRandomLower = getRandomLower;
function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
exports.getRandomUpper = getRandomUpper;
function getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}
exports.getRandomNumber = getRandomNumber;
function getRandomSymbol() {
    const symbols = '~!@#$%^&*()_+{}":?><;.,';
    return symbols[Math.floor(Math.random() * symbols.length)];
}
exports.getRandomSymbol = getRandomSymbol;
function createUniqueString() {
    const timestamp = +new Date() + '';
    const randomNum = parseInt(String((1 + Math.random()) * 65536)) + '';
    return (+(randomNum + timestamp)).toString(32);
}
exports.createUniqueString = createUniqueString;
function getRandomBool() {
    return Math.random() >= 0.5;
}
exports.getRandomBool = getRandomBool;
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
exports.getRandomFloat = getRandomFloat;
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.getRandomInt = getRandomInt;
