const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
  secret: 'your_secret_key', // 用来对session id相关的cookie进行签名
  saveUninitialized: false, // 是否自动保存未初始化的会话，建议false
  resave: false, // 是否每次请求都重新设置Session，建议false
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 有效期，单位是毫秒
  }
}));

app.get('/', (req:any, res:any) => {
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>浏览次数: ' + req.session.views + '</p>')
    res.write('<p>过期时间: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('欢迎第一次来到这里')
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});