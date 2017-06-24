const http = require('http')
const url = require('url')
const qs = require('querystring')


const server = http.createServer(function (req, res) {
  if (req.url === '/') {
    var head = '<!DOCTYPE html><head></head><body>'
    var html = head+ '<h2>Form Post Parameters: </h2>'
    html += '<ol>';
    html += '</ol>';
    html += '<form action="/addUser" method="POST">'
    html += 'Username: <input name="user" type="text" />'
    html += 'Food: <input name="food" type="text" />'
    html += '<input type="submit" value="提交" />'
    html += '</form>'
    html += '</body></html>'
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(html))

    res.end(html)
  } else {
    let body = '';
    req.on('data', function(data) {
      body += data;

      // 如果参数过多大于1MB就会终止程序
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6)
        request.connection.destroy();
      }
    );

    req.on('end', function() {
      let post = qs.parse(body);
      console.log(post)
      res.setHeader('Content-Type', 'text/html;charset=utf-8')
      res.end('Params are: ' + qs.stringify(post))
    });
  }
})

server.listen(5001);
