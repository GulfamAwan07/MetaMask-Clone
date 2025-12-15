import { ethers } from "ethers";
// const { ethers } = require("ethers");

const privateKey = "9c0b03bc95e860e6c99e63687440c3ebaf7965c0dbab61ad13ea8032c13a7c13"; 

const wallet = new ethers.Wallet(privateKey);

const publicKey = wallet.publicKey;

console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);
console.log("Address:", wallet.address);
