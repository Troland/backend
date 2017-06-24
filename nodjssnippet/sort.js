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
  let sortOrder = req.query.sort
  console.log(sortOrder)
  startPage = startPage ? + startPage : 1
  if (!sortOrder) {
    let stmt_order = `SELECT COLUMN_NAME as columnName FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = "cookbook" AND TABLE_NAME = "states" AND ORDINAL_POSITION = 1`
    connection.query(stmt_order, function (err, results, fields) {
      sortOrder = results[0].columnName
      let stmt_state = 'SELECT name, abbrev, statehood, pop FROM states ORDER BY ' + sortOrder + ' LIMIT ?, ?'
      let totalRows
      connection.query('SELECT COUNT(*) as count FROM states', function (error, results, fields) {
        totalRows = results[0].count
        console.log(sortOrder)
      })
      console.log(sortOrder)
      connection.query(stmt_state, [startPage - 1, RowsPerPage], function (err, results, fields) {
        if (err) {
          throw err
        }

        var head = '<!DOCTYPE html><head></head><body>'
        var html = head+ '<h2>Paged U.S. State List </h2>'
        var stmt = 'SELECT item FROM ingredient'
        let linkHtml = '<div>'
        html += '<table><thead><tr><th><a href="?sort=name">name</a></th><th><a href="?sort=abbrev">abbrev</a></th><th><a href="?sort=statehood">statehood</a></th><th><a href="?sort=pop">pop</a></th></tr></thead>';
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
        for (let first = 1; first <= totalRows; first += RowsPerPage) {
          let last = first + RowsPerPage - 1
          if (last > totalRows) {
            last = totalRows
          }

          if (first != startPage) {
            let linkUrl = '/?start=' + first + '&sort=' + sortOrder
            linkHtml += '<a href="'+linkUrl+'" style="margin-right:10px">' +(first + '-' + last) + '</a>'
          } else {
            linkHtml += '<span style="margin-right:10px">' +(first + '-' + last) + '</span>'
          }
        }

        linkHtml += '</div>'

        html += linkHtml
        html += '</body></html>'
        res.setHeader('Content-Type', 'text/html;charset=utf-8')
        res.setHeader('Content-Length', Buffer.byteLength(html))

        res.end(html)
      })
    })
  } else {
    let stmt_state = 'SELECT name, abbrev, statehood, pop FROM states ORDER BY ' + sortOrder + ' LIMIT ?, ?'
    let totalRows
    console.log(sortOrder)
    connection.query('SELECT COUNT(*) as count FROM states', function (error, results, fields) {
      totalRows = results[0].count
      console.log(sortOrder)
    })
    connection.query(stmt_state, [startPage - 1, RowsPerPage], function (err, results, fields) {
      if (err) {
        throw err
      }

      var head = '<!DOCTYPE html><head></head><body>'
      var html = head+ '<h2>Paged U.S. State List </h2>'
      var stmt = 'SELECT item FROM ingredient'
      let linkHtml = '<div>'
      html += '<table><thead><tr><th><a href="?sort=name">name</a></th><th><a href="?sort=abbrev">abbrev</a></th><th><a href="?sort=statehood">statehood</a></th><th><a href="?sort=pop">pop</a></th></tr></thead>';
      var tbSum = results.length
      console.log('总共记录数: ', tbSum)
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
      for (let first = 1; first <= totalRows; first += RowsPerPage) {
        let last = first + RowsPerPage - 1
        if (last > totalRows) {
          last = totalRows
        }

        if (first != startPage) {
          let linkUrl = '/?start=' + first + '&sort=' + sortOrder
          linkHtml += '<a href="'+linkUrl+'" style="margin-right:10px">' +(first + '-' + last) + '</a>'
        } else {
          linkHtml += '<span style="margin-right:10px">' +(first + '-' + last) + '</span>'
        }
      }

      linkHtml += '</div>'

      html += linkHtml

      html += '</body></html>'
      res.setHeader('Content-Type', 'text/html;charset=utf-8')
      res.setHeader('Content-Length', Buffer.byteLength(html))

      res.end(html)
    })
  }
})

app.post('/addUser', function (req, res) {
  console.log('Username: %s', req.body.user)
  console.log('Apple: %s', req.body.apples)
  res.end('Params are: ' + qs.stringify(req.body))
})

app.listen(5000, function (req, res) {
  console.log('Start server')
})
