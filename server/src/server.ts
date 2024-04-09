import express from 'express';
import cors from 'cors';
import http from 'http';
import session from 'express-session';
import { utils } from 'ethers';

const app = express();
const server = http.createServer(app);
const port = 8001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:1997',
  credentials: true
}));
app.use(session({
  secret: '1234567890', // 用来对session id相关的cookie进行签名
  saveUninitialized: false, // 是否自动保存未初始化的会话，建议false
  resave: false, // 是否每次请求都重新设置Session，建议false
  cookie: {
    maxAge: 1000 * 60 * 60 * 1 // 有效期，单位是毫秒
  }
}));

const messageMap: {
  [chain: string]: {
    [to: string]: Message[]
  }
} = {};

interface Message {
  from: string;
  data: string;
  date: number;
}

app.post('/api/getLogin', async (req: any, res: any) => {
  try {
    const reqData = req.body;
    const address = utils.getAddress(reqData.address);
    const from = req.session.address;
    if (from == address) {
      res.status(200).send({
        message: 'success'
      });
    } else {
      res.status(200).send({
        message: 'Login UniChat',
        address,
        date: new Date().getTime()
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})

app.post('/api/login', async (req: any, res: any) => {
  try {
    const reqData = req.body;
    const signature = reqData.signature;
    const message = reqData.message;
    const address = utils.getAddress(message.address);
    if (new Date().getTime() - message.date > 60 * 1000) {
      throw 'error date'
    }
    if (utils.verifyMessage(JSON.stringify(message), signature) != address) {
      throw 'error signature'
    }
    req.session.address = address;
    res.status(200).send({ message: 'success' });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})

app.post('/api/getMessage', async (req: any, res: any) => {
  try {
    const reqData = req.body;
    const chain = reqData.chain;
    const to = reqData.to;
    const start = reqData.start;
    const length = reqData.length;
    if (!messageMap[chain]) {
      messageMap[chain] = {}
    }
    if (!messageMap[chain][to]) {
      messageMap[chain][to] = []
    }
    res.status(200).send({ messageList: messageMap[chain][to].slice(start, start + length), length: messageMap[chain][to].length });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
})

app.post('/api/sendMessage', async (req: any, res: any) => {
  try {
    const reqData = req.body;
    const from = req.session.address;
    if (!from) {
      throw 'error from'
    }
    const chain = reqData.chain;
    if (chain != '1') {
      throw 'error chain'
    }
    const to = reqData.to;
    const data = reqData.data;
    const date = new Date().getTime();
    if (!messageMap[chain]) {
      messageMap[chain] = {}
    }
    if (!messageMap[chain][to]) {
      messageMap[chain][to] = []
    }
    messageMap[chain][to].push({
      from,
      data,
      date
    })
    res.status(200).send({ date });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


