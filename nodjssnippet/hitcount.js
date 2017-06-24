/*
*表结构是字段有path, hits
*利用LAST_INSERT_ID来计算当路径不在表中的时候创建一条记录并且赋值hits为1，当已经存在的时候则加1
 */
app.get('/', function (req, res) {
  var path = req.path
  var $stmt = `INSERT INTO hitcount (path,hits) VALUES(?,LAST_INSERT_ID(1)) ON DUPLICATE KEY UPDATE hits = LAST_INSERT_ID(hits+1)`;
  var count;
  connection.query($stmt, [path], function (err, results, fields) {
    count = results.insertId;
    console.log(count)
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.end('访问次数是: ' + count);
  })
})
