// 判断是否有下一页是通过多选取一行来实现的如果一页2行则在sql语句中多选取一行比如limit 1, 3
const express = require('express')
var http = require('http')
var mysql = require('mysql')
const bodyParser = require('body-parser')
var querystring = require('querystring')
var Entities = require('html-entities').XmlEntities;
var url = require('url')
const qs = require('querystring')
const entities = new Entities()
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'cbuser',
  password: 'cbpass',
  database: 'cookbook'
})

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

const RowsPerPage = 2
// routes
app.get('/', function (req, res) {
  let startPage = req.query.start
  startPage = startPage ? +startPage : 1
  // var stmt_color = 'SELECT color FROM cow_color ORDER BY color'
  // var stmt_size = 'SELECT size FROM cow_order'
  var stmt_state = 'SELECT name, abbrev, statehood, pop FROM states ORDER BY name LIMIT ?, ?'


  connection.query(stmt_state, [startPage - 1, RowsPerPage + 1], function (err, results, fields) {
    if (err) {
      throw err
    }

    var head = '<!DOCTYPE html><head></head><body>'
    var html = head+ '<h2>Paged U.S. State List </h2>'
    var stmt = 'SELECT item FROM ingredient'
    html += '<table><thead><tr><th>Name</th><th>Abbrev</th><th>Statehood</th><th>pop</th></tr></thead>';
    var tbSum = results.length
    for (var i = 0; i < RowsPerPage; i++) {
      html += '<tr>' +
                '<td>' + results[i].name + '</td>' +
                '<td>' + results[i].abbrev + '</td>' +
                '<td>' + results[i].statehood + '</td>' +
                '<td>' + results[i].pop  + '</td>' +
                '</tr>'
      //  entities.encode(results[i].color) + '</tr>';
    }
    html += '</table>';
    if (startPage > 1) {
      let prevUrl = '/?start=' + (startPage - RowsPerPage)
      html += '<a href="'+prevUrl+'">' + '下一页' + '</a>'
    } else {
      html += '<span>' + '上一页' + '</span>';
    }

    if (tbSum > RowsPerPage) {
      let nextUrl = '/?start=' + (startPage + RowsPerPage)
      html += '<a href="'+nextUrl+'">下一页' + '</a>'
    } else {
      html += '<span>下一页</span>'
    }
    // html += '<form action="/addUser" method="POST">'
    // html += '<input name="user" type="text" />'
    // html += '<input name="apples" type="text" />'
    // html += '<input type="submit" value="提交" />'
    // html += '</form>'
    html += '</body></html>'
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(html))

    res.end(html)
  })
})

app.post('/addUser', function (req, res) {
  console.log('Username: %s', req.body.user)
  console.log('Apple: %s', req.body.apples)
  res.end('Params are: ' + qs.stringify(req.body))
})

app.listen(5000, function (req, res) {
  console.log('Start server')
})
