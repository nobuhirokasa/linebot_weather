'use strict';


const axios = require('axios');
const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;
const Obniz = require('obniz');
const config = {
  channelSecret: '',
  channelAccessToken: ''
};
const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);
var speaker;

var obniz = new Obniz("*****");
obniz.onconnect = async function () {
  obniz.display.clear();
  obniz.display.print("Hello World");
  speaker = obniz.wired("Speaker", {signal:0, gnd:1});
  speaker.play(3000);
}

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  
  let mes = ''
  if(event.message.text === '天気'){
    mes = 'ちょっと待ってね';
    getWeatherVer(event.source.userId);
  }else{
    mes = `入力はつぎのパターンが使用可能です。`+"\n"+`天気を確認する→「天気」`;
  }
  if(event.message.text === '止める'){
    
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: mes
  });
}

const getNodeVer = async (userId) => {
    const res = await axios.get('https://www.iibc-global.org/toeic/official_data/lr/data_avelist/239.html#anchor02');
    const item = res.data;
    const version1 = item.match(/<h2 id="anchor02">(.*?)</)[1]; //正規表現で(無理やり)取得
   
    await client.pushMessage(userId, {
        type: 'text',
        text: `${version1}だよ`+"\n"+`確認してみてね！`+"\n"+`https://www.iibc-global.org/toeic/official_data/lr/data_avelist/239.html#anchor02`,
        
    });
}
const getWeatherVer = async (userId) => {
  const res = await axios.get('http://weather.livedoor.com/forecast/webservice/json/v1?city=130010');
  const item = res.data;

  await client.pushMessage(userId, {
      type: 'text',
      text: item.description.text,
  });
}

module.exports = app;
console.log(`Server running at ${PORT}`);
