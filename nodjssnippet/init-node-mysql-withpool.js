const express = require('express')
var http = require('http')
var mysql = require('mysql')
const bodyParser = require('body-parser')
var querystring = require('querystring')
var Entities = require('html-entities').XmlEntities;
var url = require('url')
const qs = require('querystring')
const entities = new Entities()
var pool = mysql.createPool({
  host: 'localhost',
  user: 'cbuser',
  password: 'cbpass',
  database: 'cookbook'
})

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const RowsPerPage = 2
// routes
app.get('/', function(req, res) {
  var path = req.path
  var $stmt = `SELECT * FROM hitcount`;
  var count;

  pool.getConnection(function(err, connection) {
    connection.query($stmt, function(err, results, fields) {
      let $countState = 'SELECT COUNT(*) AS count FROM states';
      connection.release();
    })
  });

  // Another query
  pool.getConnection(function(err, connection) {
    let $countState = 'SELECT COUNT(*) AS count FROM states';
    connection.query($countState, function(err, results, fields) {
      if (!err) {
        let sum = results[0].count
        res.setHeader('Content-Type', 'text/html;charset=utf-8')
        res.end('共有多少州: ' + sum);
        connection.release();
      }
    })
  })

  pool.on('release', function(connection) {
    console.log('Connection %d released', connection.threadId);
  });
})

app.listen(5000, function(req, res) {
  console.log('Start server')
})
