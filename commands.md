`SELECT @@sql_mode` output the sql mode

## Working with strings

`SHOW CHARACTER SET` see which character sets are available for nonbinary strings.
`LENGTH` return length of a string in bytes
`CHAR_LENGTH` return length of a string in characters
`SET NAMES 'utf8'` change character set
`CHARSET()` `COLLATION()` `CONVERT()` `COLLATE` change character set
`USER()` return current connect user
`UPPER()` `LOWER()` convert the lettercase of a string
```
CREATE FUNCTION initial_cap (s VARCHAR(255))
RETURNS VARCHAR(255) DETERMINISTIC
RETURN CONCAT(UPPER(LEFT(s,1)),MID(s,2));
```
a function to convert the first letter of a string

### Controlling case sensitivity in String comparisons
### Breaking Apart or Combing Strings

`LEFT()`, `MID()`, `RIGHT()`, `CONCAT()`, `SUBSTRING()`, `SUBSTRING_INDEX(string, c, n)`
SUBSTRING_INDEX default return everyting to its left while reverse the direction.

### Search for substrings
`LOCATE`

### FULLTEXT Search
Before use `LOAD DATA LOCAL INFILE 'kjv.txt' INTO TABLE kjv`, you should start mysql by `mysql --local-infile=1 -uroot -p`
`ALTER TABLE tbl_name ADD FULLTEXT (col1, col2, col3);` search multiple column simultaneously.

### Using a Full-Text Search with Short Words

Change the indexing engine's minumum word length parameter.If you use MyISAM engine.In my.cnf, set
```
[mysqld]
ft_min_word_len = 4
```
restart server and use `REPAIR TABLE kjv QUICK;`
InnoDB使用`innodb_ft_min_token_size`.启动后使用`ALTER TABLE kjv DROP INDEX vtext, ADD FULLTEXT (vtext);`

### Requiring or Prohibiting Full-Text Search Words

```
SELECT COUNT(*) FROM kjv
WHERE MATCH(vtext) AGAINST('David') AND MATCH(vtext) AGAINST('Goliath');
```

or

```
SELECT COUNT(*) FROM kjv WHERE MATCH(vtext) AGAINST('+David +Goliath' IN BOOLEAN MODE);
```

Search rows containing the name David but not Goliath:
`SELECT COUNT(*) FROM kjv WHERE MATCH(vtext) AGAINST('+David -Goliath' IN BOOLEAN MODE);`

### Performing Full-Text Phrase Searches

`SELET COUNT(*) FROM kjv WHERE MATCH(vtext) AGAINST('"still small voice"' IN BOOLEAN MODE);`

## Working with Dates and Times

`CURTIME()`: 当前时间。`DATE_FORMAT` or `TIME_FORMAT`: 改变日期显示的格式.`STR_TO_DATE(dateString, '%M %d, %Y')`: rewrite non-ISO values for date entry.

If the server time zone is different from the client's time zone set the time zone equal the server's
`SET SESSION time_zone = '+04:00';`
`SELECT @@global.time_zone, @@session.time_zone;`

`CONVERT_TZ` convert individual date-and-time values from one time zone to another.

## Determining the Current Date or Time

`CURDATE()`, `CURTIME()`, `NOW()` to obtain values expressed in the client session time zone.
`UTC_DATE`, `UTC_TIME`, `UTC_TIMESTAMP` for values in UTC time


## Extracting Parts of Dates or Times

`MONTH()`, `MINUTE()`, `DATE()`, `TIME()`, `EXTRACT`, `DATE_FORMAT`, `TIME_FORMAT`

## Synthesizing Dates or Times from Component Values

`MAKETIME`, `DATE_FORMAT`, `TIME_FORMAT`, `CONCAT`
`LPAD` to add a leading zero as necessary to ensure the month has two digits.
`SELECT d, CONCAT(YEAR(d), '-', LPAD(MONTH(d), 2, '0'), '-01') FROM date_val;` to make sure the month has two digits.

## Converting Between Temporal Values and Basic Units

`TIME_TO_SEC()`, `SEC_TO_TIME()`, `TO_DAYS()`, `FROM_DAYS()`, `UNIX_TIMESTAMP()`, `FROM_UNIXTIME`

## Calculating Intervals Between Dates or Times

`DATEDIFF` calucate the day Intervals,`TIMEDIFF` calucate time intervals,`TIMESTAMPDIFF` calculate datetime inervals.

## Adding Date or Time Values

`ADDTIME`, `TIMESTAMP`, `DATE_ADD` add interval, `DATE_SUB` subtracting intervals
`TIMESTAMPADD` like the `DATE_ADD`
`DAYOFMONTH(LAST_DAY(d))` to caculate days of a month
`SELECT d, DATE_SUB(d,INTERVAL DAYOFMONTH(d)-1 DAY) AS '1st of month'` find the first day of the month for a given date
`DATE_ADD(DATE_SUB(d,INTERVAL DAYOFMONTH(d)-1 DAY),INTERVAL n MONTH)` to find the first of the month for any month n months away from a given date

## Finding Dates for Any Weekday of a Given Week

`DAYOFWEEK` return 1 through 7 for Sunday through Saturday.`WEEKDAY` treats Monday as the first day of the week return 0 through 6 for Monday through Sunday.
`DAYNAME` determining the name of the day
`DAYOFYEAR` pass it the date of the last day of the year DAYOFYEAR(DATE_FORMAT(@d1,'%Y-12-31'))

## Sort variable-length of substrings

`SUBSTRING_INDEX(str,c,n)` It searches a string str for the n-th occurrence of a given character c and returns everything to the left of that character.`SUBSTRING_INDEX('13-478-92-2','-',2)` returns *13-478*.

## Sorting Dotted-Quad IP Values in Numeric Order
`INET_ATON` convert network addresses in string form to their underlying numeric values.
`INET_NTOA` versa

# Using Stored Routines, Triggers, and Scheduled Events

CREATE PROCEDURE

# Creating Compound-Statement Objects

`delimiter` change the default mysql delimiter

## Using Events to Schedule Database Actions

`SHOW VARIABLES LIKE 'event_scheduler'` to check scheduler status
`DROP EVENT mark_insert` remove event
ALTER EVENT mark_insert DISABLE; to disable the event
ALTER EVENT mark_insert ENABLE; to enable the event

## Table Meta

`INFORMATION_SCHEMA` portable source of metadata, `SCHEMATA` as `SHOW DATABASES`
`TABLES` as `SHOW TABLES` COLUMNS as `SHOW COLUMNS`

## Listing or Checking Existence of Databases or Tables

`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA;` to get information about the databses and tables
`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'cookbook';`

## Accessing Table Column Definitions

SHOW COLUMNS, SHOW CREATE TABLE
SELECT * FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cookbook' AND TABLE_NAME = 'item'
AND COLUMN_NAME = 'colors'\G

SHOW FULL COLUMNS

## Getting Server Metadata

SELECT VERSION()

## Importing and Exporting Data

FIELDS TERMINATED BY 0x01 LINES TERMINATED BY 0x02
Tab is 0x09,linefeed is 0x0a, carriage return is 0x0d.
LOAD DATA LOCAL INFILE 'mytbl.txt' INTO TABLE mytbl (b,c,a)

## Guessing Table Structure from a Datafile

SELECT @@sql_mode\G display sqlMode
SET sql_mode = 'TRADITIONAL'; to set constellation of modes.

`TRUNCATE TABLE tbl_name;` to empty a table and reset the sequence counter.
`LAST_INSERT_ID` retirve the insert row id.

## Statistics

STDDEV_SAMP produce sample measures rather than population measures, STDDEV_POP same as STDDEV
VAR_SAMP VAR_POP same as VARIANCE.

```
SELECT @mean := AVG(score), @std := STDDEV_SAMP(score) FROM testscore; SELECT score FROM testscore WHERE ABS(score-@mean) > @std * 3;
```

produce chart:
SET @n = (SELECT COUNT(score) FROM testscore);
SELECT score,
REPEAT('*',(COUNT(score)*100)/@n) AS 'percent histogram'
FROM testscore GROUP BY score;

RAND(): Generating random numbers

## Assign Ranking

Method 1:
```
SET @rownum := 0;
SELECT @rownum := @rownum + 1 AS rank, score
FROM t ORDER BY score DESC;
```

Method 2:
SET @rank = 0, @prev_val = NULL;
ELECT @rank := IF(@prev_val=score,@rank,@rank+1) AS rank,
@prev_val := score AS score
FROM t ORDER BY score DESC;
for duplicate rows should have the same rank number

Method 3:
the rank will not sequence like: 1, 2, 2, 4 is a combined method of the previous two
SET @rownum = 0, @rank = 0, @prev_val = NULL;
SELECT @rownum := @rownum + 1 AS row,
@rank := IF(@prev_val<>score,@rownum,@rank) AS rank, -> @prev_val := score AS score
FROM t ORDER BY score DESC;

Find all tables in target databases:
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'cookbook' ORDER BY TABLE_NAME

# Server Administration

SELECT @@plugin_dir: list the plugin dir
SHOW PLUGINS: show the installed plugins
query INFORMATION_SCHEMA PLUGINS table to find the installed plugins
--plugin-load-add to only install plugin for a given server invocation

[mysqld]
log_error=err.log
log_output=TABLE
general_log=1
slow_query_log=1
log-bin=/var/mysql-logs/binlog

[mysqld]
log_output=FILE
general_log=1
general_log_file=query.log

[mysqld]
log_output=FILE,TABLE
general_log=1
general_log_file=query.log

[mysqld]
log-bin=binlog
max_binlog_size=4G
expire_logs_days=7

PURGE BINARY LOGS TO to remove binary logfiles

DROP TABLE IF EXISTS mysql.general_log_old, mysql.general_log_new; CREATE TABLE mysql.general_log_new LIKE mysql.general_log;
RENAME TABLE mysql.general_log TO mysql.general_log_old,
mysql.general_log_new TO mysql.general_log;

Automatic expiration

CREATE EVENT expire_general_log ON SCHEDULE EVERY 1 WEEK
DO DELETE FROM mysql.general_log
WHERE event_time < NOW() - INTERVAL 1 WEEK;

To see which InnoDB-related tables are available, use this statement:
SHOW TABLES FROM INFORMATION_SCHEMA LIKE 'innodb%';

Indicates the server is running:
mysqladmin ping

SHOW GLOBAL STATUS LIKE 'Uptime';

How many querys:
SHOW GLOBAL STATUS LIKE 'Queries';

SELECT @@wait_timeout;获得会话超时时间

SET wait_timeout = seconds;

SHOW THE SLAVE INFORMATION:
SHOW SLAVE STATUS

SELECT * FROM performance_schema.replication_connection_status\G
To determine the cache sizes
SELECT @@innodb_buffer_pool_size, @@key_buffer_size;

SELECT * FROM INFORMATION_SCHEMA.GLOBAL_VARIABLES WHERE
VARIABLE_NAME IN ('INNODB_BUFFER_POOL_SIZE','KEY_BUFFER_SIZE');

Increasing innodb_buffer_pool_size or key_buffer_size to make the hit rate high.
SHOW GLOBAL STATUS; SELECT * FROM INFORMATION_SCHEMA.GLOBAL_STATUS;

mysqldump --routines --events db1 > dump.sql
mysqldump --routines --events --databases db1 db2 db3 > dump.sql

Backup all databases:
mysqldump --routines --events --all-databases > dump.sql

CREATE USER 'user_name'@'host_name' IDENTIFIED BY 'password';

Use one of following:
CREATE USER 'user_name'@'host_name' IDENTIFIED WITH 'mysql_native_password'; SET old_passwords = 0;
CREATE USER 'user_name'@'host_name' IDENTIFIED WITH 'mysql_old_password'; SET old_passwords = 1;
CREATE USER 'user_name'@'host_name' IDENTIFIED WITH 'sha256_password'; SET old_passwords = 2;

Set passwords:
SET PASSWORD FOR 'user_name'@'host_name' = PASSWORD('password');

GRANT privileges ON scope TO account;
SET PASSWORD = PASSWORD('my-new-password') assign yourself a new password
SET PASSWORD FOR 'user_name'@'host_name' = PASSWORD('my-new-password'); assign other user the password.

Identify the anomous users:
SELECT User, Host FROM my
sql.user WHERE User = '';

WHERE Host LIKE '%\%%' OR Host LIKE '%\_%';
WHERE Host REGEXP '[%_]';

SELECT User, Host FROM mysql.user WHERE Host REGEXP '[%_]'; Identify patter-host accounts in mysql.user table
