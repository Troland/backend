// 当跨域配置用cors插件
var cors = require('cors')
app.use(cors())

app.post('/api/num', function (req, res) {
  // 假设头是request.setRequestHeader('Authorization', 'Bearer ' + token);
  req.get('authorization');
})
