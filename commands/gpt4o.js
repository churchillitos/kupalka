const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", 
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (text) => {
  return text.split('').map(char => gothicFont[char] || char).join('');
};

const MAX_MESSAGE_LENGTH = 2000;
const DELAY_BETWEEN_MESSAGES = 500;

function sendLongMessage(senderId, text, pageAccessToken) {
  if (text.length > MAX_MESSAGE_LENGTH) {
    const messages = splitMessageIntoChunks(text, MAX_MESSAGE_LENGTH);
    messages.forEach((messageGroup, index) => {
      setTimeout(() => sendMessage(senderId, { text: messageGroup }, pageAccessToken), index * DELAY_BETWEEN_MESSAGES);
    });
  } else {
    sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}

module.exports = {
  name: 'gpt4o',
  description: 'Ask GPT-4o for a response to a given query',
  usage: 'gpt4o <query>',
  author: 'Churchill',
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Please provide a query for GPT-4o.' }, pageAccessToken);
      return;
    }

    const query = args.join(' ');

    try {
      const apiUrl = `${api.joshWebApi}/api/gpt-4o?q=${encodeURIComponent(query)}&uid=1`;
      const response = await axios.get(apiUrl);
      if (response.data.status) {
        const gothicResponse = convertToGothic(response.data.result);
        sendLongMessage(senderId, gothicResponse, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Error: GPT-4o could not provide a response.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'An error occurred while getting a response from GPT-4o.' }, pageAccessToken);
    }
  }
};
