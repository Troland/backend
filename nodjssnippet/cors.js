/*前端只需要在请求的时候加上
xhrFields: {
  withCredentials: true
}
如果不需要cookie话就不用设置这个参数
即可
*/

// 当跨域配置用cors插件
const cors = require('cors')
// 设置白免单可以指定允许多个ip源访问
const whitelist = [
  'http://192.168.1.139:3003',
  'http://192.168.1.139:3100'
]
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, //这里必须写这样才能够接收到header里面的cookie,若不需要获得cookie可不设置
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
}
const app = express()

app.use(cors(corsOptions))

app.post('/api/num', function (req, res) {
  // 假设头是request.setRequestHeader('Authorization', 'Bearer ' + token);
  req.get('authorization');
})
