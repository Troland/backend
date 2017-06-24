# Construct SQL statements that refer to data values containing special characters such as quotes or backslashes or special values such as NULL.

* When value contain single quote, use single quote, backslash, or double quote such as
  INSERT INTO profile(name,birth,color,foods,cats)
  VALUES('De''Mont','1973-12-25','blue','eggroll',4)
  INSERT INTO profile(name,birth,color,foods,cats)
  VALUES('De\'Mont','1973-12-25','blue','eggroll',4)
  INSERT INTO profile(name,birth,color,foods,cats)
  VALUES("De'Mont",'1973-12-25','blue','eggroll',4)

* SQL NULL value is not a special character, but it too requires special treatment.In SQL,NULL indicates"no value."
  placeholder mechanism adds quotes around numeric values.DBI relies on the MySQL server to perform type conversion as necessary to convert strings to numbers.
  两种解决方法:
  * 运用placeholder

    ```
    INSERT INTO profile(?,?,?,?,?)
    VALUES('De\'Mont', '1973-01-12', NULL, 'eggroll', '4')
    ```
  * quote方法

    ```
    my $stmt = sprintf("INSERT INTO profile(name,birth,color,foods,cats)
                                VALUES(%s,%s,%s,%s)",
                                $dbh->quote("De'Mont"),
                                $dbh->quote("1973-01-12"),
                                $dbh->quote(undef),
                                $dbh->quote('eggroll'),
                                $dbh->quote(4));
    ```

* To make an identifier safe for insertion into an SQL statement,quote it by enclosing it within backticks.
  ``CREATE TABLE `some table`(i INT)``

`ANSI_QUOTES SQL mode` if enabled can permit for identifier quoting equal with backticks.
Use `SELECT @@sql_mode` to retrieve the SQL mode and check whether its value includes ANSI_QUOTES.
If a quoting character appears within the identifier itself, double it when quoting the identifier.For example quote ``abc`def`` as ``` `abc``def` ```

* A query result includes NULL values, but you're not sure how to identify them.
  PHP is_null function to detect if the value is `NULL` which euqals to `===` operator.
  `SELECT subject, test, IF(score IS NULL, 'Unknown', score) AS 'score' FROM expt`, you can set the NULL value

* Obtain connection parameters

  * The parameters can be given either in the main source file or in a library file
  * Ask for the parameters interactively
  * Get the parameters from the command line
  * Get the parameters from the execution environment
  * Get the parameters from a separate file

The above methods involves security issue:
  * Any method that store connection parameters in a file may compromise your system's security unless the file is protected against access by unauthorized users.
  * Parameters specified on the command line or in environment variables are not particularly secure.Someone can use `ps -e` to see the program's command-line arguments.

You create multiple config files to distribute different type of permission, or you can list multiple groups within the same option file and let the scripts select options from the appropriate group.

## My sql statement

* The column names in a query result are unsuitable, use aliases to choose your own cloumn names such as SELECT DATE_FORMAT(t, '%M %e, %Y') AS date_sent, CONCAT(srcuser,'@', srchost) AS sender, size FROM mail;

* Eliminate duplicate rows use `DISTINCT`
`SELECT DISTINCT srcuser FROM mail`

* Use IS NULL or IS NOT NULL to look for values that are or are not NULL
`SELECT * FROM expt WHERE score IS NOT NULL`.
If you want to map NULL onto the string Unknown.Use`IF`. `SELECT subject, test, IF(score IS NULL, 'Unknown', score) AS 'score' FROM expt;` or use `IFNULL`.`SELECT subject, test, IFNULL(score, 'Unknown')` AS 'score' FROM expt;`

## Using Views to Simplify Table Access
You want to refer to values calculated from expressions without writing the expressions each time.

## SELECTING DATA from Multiple Tables
Use a join or a subquery
`SELECT id, name, service, contact_name FROM profile INNER JOIN profile_contact ON id = profile_id;`
`SELECT * FROM profile_contact WHERE profile_id = (SELECT id FROM profile WHERE name = 'Nancy');`

## Sometimes the sort order differs from what you want for the final result
Use the code `SELECT * FROM (SELECT name, birth FROM profile ORDER BY birth DESC LIMIT 4) AS t ORDER BY birth;`

## Table Management

- Cloning a Table
`CREATE TABLE new_table LIKE original_table`

- Save the query result to a table rather than display it
If table exists, retrieve rows into it using INSERT INTO ... SELECT or using CREATE TABLE...SELECT.`Insert INTO dst_tbl (i, s) SELECT val, name FROM src_tbl`.`CREATE TABLE dst_tbl SELECT * FROM src_tbl;`
`CREATE TABLE dst_tbl SELECT * FROM src_tbl WHERE FALSE;` can create empty table.
If you want create the table in addition to those selected from the source table.
```
CREATE TABLE dst_tbl
(
  id INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (id)
)
SELECT a, b, c FROM src_tbl;
```
or create different column name using:
```
CREATE TABLE dst_tbl
SELECT inv_no, SUM(unit_cost*quantity) AS total_cost
FROM src_tbl GROUP BY inv_no;
```
If source table has PRIMARY KEY or multiple-column index, you should explicitly specify them in dst table.
`CREATE TABLE dst_tbl (PRIMARY KEY (id), INDEX(state, city)) SELECT * FROM src_tbl;`
Column attributes such as AUTO_INCREMENT and a column's default value are not copied to the destination table.
CREATE TABLE dst_tbl (PRIMARY KEY (id)) SELECT * FROM src_tbl;
ALERT TABLE dst_tbl MODIFY id INT UNSIGNED NOT NULL AUTO_INCREMENT;

- CREATE TEMPORARY TABLE

`CREATE TEMPORARY TABLE tbl_name(...column definitions...);` You should always drop the temporary table.
If you create the same tblname as the permanent table If program has reconnect capacity, you should test for error, for the modifications will affect the permanent instead.
Because of some apis support persistent connections or connection pool.you should alwasy use the script `DROP TEMPORARY TABLE IF EXISTS tbl_name`

## Create Unique Table Names

If MySQL is a multiple-client database server, so a given script that creates a transient table might be invoked by several clients simultaneously.
Use PID to create unique table names. PID should be used in contexts such as scripts run within multithreaded web servers in which all threads share the same process ID.Use Connection identifiers.

## Checking or Changing a Table Storage Engine

InnoDB support transactions whereas MyISAM does not.
`INFORMATION_SCHEMA`, `SHOW TABLE STATUS`, `SHOW CREATE TABLE` to check current engine.
`ALTER TABLE mail ENGINE = MyISAM;`

## Copygin a Tabel Using mysqldump

- `mysqldump cookbook mail > mail.sql, mysql other_db < mail.sql` export a tb and import to other db
- `mysqldump cookbook > cookbook.sql, mysql other_db < cookbook.sql` export all tbs and import to other db
- use pipe to table-copying operation without intermediary file `mysqldump cookbook mail | mysql other_db`

## Copying tables between MySQL servers

  `mysqldump cookbook mail > mail.sql` then copy mail.sql to other host and in the host run `mysql other_db < mail.sql`. `mysqldump cookbook mail | mysql -h other-host.com other_db` or you can connect host via `ssh`
  `mysqldump cookbook mail | ssh other-host.com mysql other_db`

# Working with strings

  If require comparison and sorting operations use the sorting rules of a particular language choose a language-specific collation.

  ```
  CREATE TABLE t (c CHAR(2) CHARACTER SET utf8);INSERT INTO t (c) VALUES('cg'),('ch'),('ci'),('lk'),('ll'),('lm');
  SELECT c FROM t ORDER BY c COLLATE utf8_general_ci;
  SELECT c FROM t ORDER BY c COLLATE utf8_spanish2_ci;
  ```

  ## You want to store string data but aren't sure which is the most appropriate data type.

  Consider the questions:
  - Are the strings binary or nonbinary?
  - Does case sensitivity matter?
  - What is the maximum string length?
  - Do you want to store fixed- or variable-length values?
  - Do you need to retain trailing spaces?
  - Is there a fixed set of permitted values?
If want to store character strings might end with space use VARCHAR or one of the TEXT data types.

## Setting the Client Connection CharacterSet

USE `SET NAMES` or --default-character-set option in command or write in the option file [mysql] default-character-set=utf8 or you can set the character set on the api as java `jdbc:mysql://localhost/cookbook?characterEncoding=UTF-8`.

## Write String Literals

- You should use single quote because when ANSI_QUOTES SQL mode is enable, server interprets doble quote as quoting character for identifiers.

- use introducer as `_latin1 'abcd'`

- use enclose a string containing double quotes within single quotes and versa.but take care of the ASNI_QUOTES mode.`SELECT "I 'm asleep";`

- double the quote or use backslash. `SELECT 'I''m asleep', 'I\'m wide awake';`

- write the string as a hex value

## Change Character Set

`SET @s1 = _latin1 'my string', @s2 = CONVERT(@s1 USING utf8);` change character set
`SET @s1 = _latin1 'my string', @s2 = @s1 COLLATE latin1_spanish_ci;` change collation
`SET @s2 = CONVERT(@s1 USING utf8) COLLATE utf8_spanish_ci;` change character set and collation

## Comparison

You can change the column type.`ALTER TABLE news MODIFY article TEXT CHARACTER SET utf8 COLLATE utf8_general_ci;`

## Pattern Matching

Use `LIKE` operator

## Using Full-Text Searches
When you search via SELECT * from tbl_name WHERE col1 LIKE 'pat' OR col2 LIKE 'pat' ..., you should add a FULLTEXT index to your table.Use MATCH operator to search in the index column for nonbinary string data types.


# Working with date and time

To store values that are not in ISO format.If your values are close to ISO format, rewriting may not be necessary such as 87-1-7 and 1987-1-7, 870107, 19870107 as 1987-01-07.
DATE_FORMAT() function to display date.
Write a stored function:

```
CREATE FUNCTION time_ampm (t TIME)
RETURNS VARCHAR(13) # mm:dd:ss {a.m.|p.m.} format DETERMINISTIC
RETURN CONCAT(LEFT(TIME_FORMAT(t, '%r'), 9), IF(TIME_TO_SEC(t) < 12*60*60, 'a.m.', 'p.m.'));
```

### Setting the Client Time Zone

Have a client app connects from different time zone.
Client should set `time_zone` system variable
If the server time zone is different from the client's time zone set the time zone equal the server's
`SET SESSION time_zone = '+04:00';`
`SELECT @@global.time_zone, @@session.time_zone;`

### Using TIMESTAMP or DATETIME to Track Row-Modification Times

You want to record row-creation time or last modification time automatically.
Use the auto-initialization and auto-update properties of the TIMESTAMP and DATETIME data types.
A column with DEFAULT CURRENT_TIMESTAMP attribute initializes automatically for new rows.
A TIMESTAMP or DATETIME column decleared with the ON UPDATE CURRENT_TIMESTAMP attribute automatically updates to the current date and time when you change other column in the row.
`CREATE TABLE tsdef (ts TIMESTAMP DEFAULT '2000-01-01 00:00:00');` because of the sqlmode you can't set the default value with 0.

### Adding Date or Time Values

Use `MOD` if the time plus exceed 24 hour

### Age determination

`TIMESTAMPDIFF`

### Finding the First Day, Last Day, or Length of a Month

`LAST_DAY`, `DAYOFMONTH`
`SELECT d, DATE_SUB(d,INTERVAL DAYOFMONTH(d)-1 DAY) AS '1st of month'` find the first day of the month for a given date
`DATE_ADD(DATE_SUB(d,INTERVAL DAYOFMONTH(d)-1 DAY),INTERVAL n MONTH)` to find the first of the month for any month n months away from a given date
`DAYOFMONTH(LAST_DAY(d))` to caculate days of a month

### Calculating Dates by Substring Replacement

`DATE_FORMAT(d,'%Y-%m-01') AS '1st of month A',`
`CONCAT(YEAR(d),'-',LPAD(MONTH(d),2,'0'),'-01')`

### Finding the Day of the Week for a Date

`DAYNAME`

### Finding Dates for any weekday of a given week

`DATE_ADD(d,INTERVAL 1-DAYOFWEEK(d) DAY) AS Sunday`
`DATE_ADD(d,INTERVAL 7-DAYOFWEEK(d) DAY) AS Saturday`
Calculating the date for a day of the week in some other week is a problem that breaks down into a day-within-week shift (using the formula just given) plus a week shift

```
SET @target =
DATE_SUB(DATE_ADD(CURDATE(),INTERVAL 4-DAYOFWEEK(CURDATE()) DAY), INTERVAL 14 DAY);
SELECT CURDATE(), @target, DAYNAME(@target);
```

### Performing Leap-Year Calculations

Leap year must satisfy both of these constraints:

- The year must be divisible by four
- The year cannot be divisible by 100, unless it is also divisible by 400.

`(YEAR(d) % 4 = 0) AND ((YEAR(d) % 100 <> 0) OR (YEAR(d) % 400 = 0))`
`DAYOFYEAR` get the days of year

### Canonizing Not-Quite-ISO Date Strings

```
DATE_ADD(d,INTERVAL 0 DAY)
d + INTERVAL 0 DAY
FROM_DAYS(TO_DAYS(d))
STR_TO_DATE(d,'%Y-%m-%d')
LPAD
```
`SELECT * FROM history WHERE d = DATE_SUB(CURDATE(),INTERVAL 50 YEAR);` to find a event in this day 50 years ago.`
`DELETE FROM mytbl WHERE create_date < DATE_SUB(NOW(),INTERVAL n DAY);` to delete expired rows n days ago.
`INSERT INTO mytbl (expire_date,...) VALUES(DATE_ADD(NOW(),INTERVAL n DAY),...);`

### Comparing dates to calendar-day

`WHERE MONTH(d) = MONTH(CURDATE());` who has birthday this month
`WHERE MONTH(d) = MONTH(CURDATE()) AND DAYOFMONTH(d) = DAYOFMONTH(CURDATE());` tell Who has a birthday today

who has birthday next month:
```
WHERE MONTH(d) = MONTH(DATE_ADD(CURDATE(),INTERVAL 1 MONTH));
WHERE MONTH(d) = MOD(MONTH(CURDATE()),12)+1;
```

## Sorting Query Results

You should sort lexically and lexical order often differs from numeric order.
`SELECT name, jersey_num FROM roster ORDER BY jersey_num+0;`

## Controlling Case Sensitivity of String Sorts

To sort case-insensitive strings in case-sensitive fashion, order the sorted values using a case-sensitive collation `SELECT ci_str FROM str_val ORDER BY ci_str COLLATE latin1_general_cs;`

Binary strings sort using numeric byte values,To sort binary strings using a case-insensitive ordering, convert them to nonbinary strings and apply an appropriate collation
`SELECT bin_str FROM str_val ORDER BY CONVERT(bin_str USING latin1) COLLATE latin1_swedish_ci;`

### Sort by day of week

`SELECT DAYNAME(date) AS day, date, description FROM occasion ORDER BY DAYOFWEEK(date)`
`MOD(DAYOFWEEK(date)+5, 7)` to map Monday to 0, Tuesday to 1
```
SELECT * FROM housewares ORDER BY LEFT(id,3);#id's format is abbrv of furniture + serialnum + country code such as BED00038SG
```

### Sort variable-length of substrings

`SELECT id, LEFT(SUBSTRING(id,4),CHAR_LENGTH(SUBSTRING(id,4)-2))`
`SELECT id, SUBSTRING(id,4), SUBSTRING(id,4,CHAR_LENGTH(id)-5)`
`SELECT * FROM housewares3 ORDER BY SUBSTRING(id,4,CHAR_LENGTH(id)-5)+0;` to order numeric sort rather than lexically

### Sorting Hostnames in Domain Order

*mysql.com, lists.mysql.com* some have three segments other have two
To fix this problem, add a sufficient number of periods at the beginning of the hostname values to guarantee that they have the requisite number of segments
`SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT('..',name),'.',-3),'.',1)`
`SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT('.',name),'.',-2),'.',1)`

```
SELECT name FROM hostname
ORDER BY
SUBSTRING_INDEX(name,'.',-1),
SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT('.',name),'.',-2),'.',1)
SUBSTRING_INDEX(SUBSTRING_INDEX(CONCAT('..',name),'.',-3),'.',1);
```

### Sorting Dotted-Quad IP Values in Numeric Order

To produce a numeric or‐ dering instead, sort them as four-part values with each part sorted numerically
Or represent the IP numbers as 32-bit unsigned integers.
```
SELECT ip FROM hostip
ORDER BY
SUBSTRING_INDEX(ip,'.',1)+0,
SUBSTRING_INDEX(SUBSTRING_INDEX(ip,'.',-3),'.',1)+0,
SUBSTRING_INDEX(SUBSTRING_INDEX(ip,'.',-2),'.',1)+0,
SUBSTRING_INDEX(ip,'.',-1)+0;
```
or use `INET_ATON`

### Floating Values to the Head or Tail of the Sort Order

`SELECT val FROM t ORDER BY IF(val IS NULL,1,0), val;` will tail the values such as:
3
9
100
NULL
NULL
`IF(val IS NULL,0,1)` NULL values at the start
Select first those rows where people sent messages to themselves
`SELECT t, srcuser, dstuser, size FROM mail ORDER BY IF(srcuser=dstuser,0,1), srcuser, dstuser;`

### Defining a Custom Sort Order

`FIELD` to map column values to a sequence that places the values in the desired order

### Sorting ENUM Values

To sort *ENUM* values in lexical order force them to be treated as strings for sorting using the `CAST`
`SELECT day, day+0 FROM weekday ORDER BY CAST(day As CHAR);`

# Generating Summaries

`SELECT DISTINCT` to obtain a list of unique values.Full scan quick for MyISAM but for InnoDB.

```
SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'cookbook' AND TABLE_NAME = 'states';
```
to avoid full scan with InnoDB if approximate row count is allowed.
`COUNT(DISTINCT)` ignore NULL values use one of the following:
```
COUNT(DISTINCT val) + IF(COUNT(IF(val IS NULL,1,NULL))=0,0,1)
COUNT(DISTINCT val) + IF(SUM(ISNULL(val))=0,0,1)
COUNT(DISTINCT val) + (SUM(ISNULL(val))<>0)
```
```
SELECT pop AS 'highest population', name FROM states
WHERE pop = (SELECT MAX(pop) FROM states);
```

Use joins
```
CREATE TEMPORARY TABLE tmp SELECT MAX(pop) as maxpop FROM states;
SELECT states.* FROM states INNER JOIN tmp
ON states.pop = tmp.maxpop;
```

## Controlling String Case Sensitivity for MIN() and MAX()
MIN() and MAX() select strings in case-sensitive fashion when you don’t want them to, or vice versa.
```
CREATE TEMPORARY TABLE t
SELECT name, MAX(miles) AS miles FROM driver_log GROUP BY name;
SELECT d.name, d.trav_date, d.miles AS 'longest trip'
FROM driver_log AS d INNER JOIN t USING (name, miles) ORDER BY name;
```

## Summaries and NULL Values

If there’s nothing to summarize, which occurs if the set of values is empty or contains only NULL values
`IFNULL(SUM(score),0) AS total`

## Selecting Only Groups with Certain Characteristics

Using `HAVING`.`SELECT COUNT(*), name FROM driver_log GROUP BY name  HAVING COUNT(*) > 3;`

## Using Counts to Determine Whether Values Are Unique

Using HAVING with COUNT

## Grouping by Expression Results

`SELECT MONTHNAME(statehood) AS month, DAYOFMONTH(statehood) AS day,COUNT(*) AS count FROM states GROUP BY month, day HAVING count > 1;`

## Summarizing Noncategorical Data

SELECT FLOOR(pop/5000000) AS `max population (millions)`,COUNT(*) AS `number of states`
FROM states GROUP BY `max population (millions)`;
SELECT COUNT(DISTINCT t) / COUNT(t) FROM mail; rely on the values to judge if it's efficient for grouping the values into categories

## Finding Smallest or Largest Summary Values
`SELECT name, SUM(miles) FROM driver_log GROUP BY name ORDER BY SUM(miles) DESC LIMIT 1;`

```
SET @max = (SELECT COUNT(*) FROM states GROUP BY LEFT(name,1) ORDER BY COUNT(*) DESC LIMIT 1);
SELECT LEFT(name,1) AS letter, COUNT(*) FROM states
GROUP BY letter HAVING COUNT(*) = @max;
```

## Working with Per-Group and Overall Summary Values Simultaneously
WITH ROLLUP To display different summary-level values (and not perform calculations involving one summary level against another), add WITH ROLLUP to the GROUP BY clause

## Generating a Report That Includes a Summary and a List

If binary logging is enabled for your MySQL server:

- You must have the SUPER privilege, and you must declare either that the function is deterministic or does not modify data by using one of the DETERMINISTIC, NO SQL, or READS SQL DATA characteristics. (It’s possible to create functions that are not deterministic or that modify data, but they might not be safe for replication or for use in backups
- Alternatively, if you enable the log_bin_trust_function_creators system variable, the server waives both of the preceding requirements. You can do this at server startup, or at runtime if you have the SUPER privilege

## Creating Compound-Statement Objects

The mysql client program uses the same terminator by default, so mysql misinterprets the definition and produces an error.
You should Redefine the mysql statement terminator with the delimiter command

```
CREATE FUNCTION avg_mail_size() RETURNS FLOAT READS SQL DATA
RETURN (SELECT AVG(size) FROM mail);

CREATE FUNCTION avg_mail_size(user VARCHAR(8)) RETURNS FLOAT READS SQL DATA
BEGIN
DECLARE avg FLOAT;
IF user IS NULL
THEN # average message size over all users
SET avg = (SELECT AVG(size) FROM mail); ELSE # average message size for given user
SET avg = (SELECT AVG(size) FROM mail WHERE srcuser = user); END IF;
RETURN avg; END;
```

## Using Triggers to Implement Dynamic Default Column Values

`BEFORE INSERT` which enables column values to be set before they are inserted into the table
CREATE TRIGGER bi_cust_invoice BEFORE INSERT ON cust_invoice FOR EACH ROW SET NEW.tax_rate = sales_tax_rate(NEW.state);

## Using Triggers to Simulate Function-Based Indexes

`SELECT * FROM expdata WHERE LOG10(value) < 2;` LOG10(value) prevent the optimizer from using any index on it.
Three methods below to optimize:

1.Define a secondary column to store the function values and index that column.
2.Define triggers that keep the secondary column uptodate when the original column is initialized or modified.
3. Referdirectly to the secondary column inqueries so that the optimizer can use the index on it for efficient lookups.

```
CREATE TABLE expdata (
id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, value FLOAT, # original values
log10_value FLOAT, # LOG10() function of original values INDEX (value), # index on original values
INDEX (log10_value) # index on function-based values );
```

CREATE TRIGGER bi_expdata BEFORE INSERT ON expdata FOR EACH ROW SET NEW.log10_value = LOG10(NEW.value);
The technique is therefore most useful if the workload for the table skews more toward retrievals than updates. It is less beneficial for a workload that is mostly updates.

Suppose that you want to store large data values such as PDF or XML documents in a table, but also want to look them up quickly later (for example, to access other values stored in the same row such as author or title)

1. Compute a hash value for each document and store it in the table along with the document. For example, use the MD5() function, which returns a 32-byte string of hexadecimal characters. That’s still long for a comparison value, but much shorter than a full-column comparison based on contents of very long documents.

2. Tolookuptherowcontainingaparticulardocument,computethedocumenthash value and search the table for that value. For best performance, index the hash

## Simulating TIMESTAMP Properties for Other Date and Time Types

`INSERT trigger` to provice the appropriate current date `UPDATE trigger` to update the column to the current date or time when the row is changed.

`CREATE TABLE ts_emulate (data CHAR(10), d DATE, t TIME);`
```
CREATE TRIGGER bi_ts_emulate BEFORE INSERT ON ts_emulate FOR EACH ROW SET NEW.d = CURDATE(), NEW.t = CURTIME();
CREATE TRIGGER bu_ts_emulate BEFORE UPDATE ON ts_emulate
FOR EACH ROW # update temporal columns only if nontemporal column changes IF NEW.data <> OLD.data THEN
SET NEW.d = CURDATE(), NEW.t = CURTIME(); END IF;
```

## Using Triggers to Log Changes to a Table
Use triggers to “catch” table changes and write them to a separate log table.

```
CREATE TABLE auction ( id INT UNSIGNED NOT NULL AUTO_INCREMENT, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, item VARCHAR(30) NOT NULL, bid DECIMAL(10,2) NOT NULL, PRIMARY KEY (id) );

CREATE TABLE auction_log (
action ENUM('create','update','delete'),
id INT UNSIGNED NOT NULL,
ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, item VARCHAR(30) NOT NULL,
bid DECIMAL(10,2)NOTNULL,
INDEX (id)
);
```
The triggers:

```
CREATE TRIGGER ai_auction AFTER INSERT ON auction FOR EACH ROW
INSERT INTO auction_log (action,id,ts,item,bid) VALUES('create',NEW.id,NOW(),NEW.item,NEW.bid);
CREATE TRIGGER au_auction AFTER UPDATE ON auction FOR EACH ROW
INSERT INTO auction_log (action,id,ts,item,bid) VALUES('update',NEW.id,NOW(),NEW.item,NEW.bid);
CREATE TRIGGER ad_auction AFTER DELETE ON auction FOR EACH ROW
INSERT INTO auction_log (action,id,ts,item,bid) VALUES('delete',OLD.id,OLD.ts,OLD.item,OLD.bid);
```

## Using Events to Schedule Database Actions

`SHOW VARIABLES LIKE 'event_scheduler'` to check scheduler status
SET GLOBAL event_scheduler = 1; to enable scheduler
to write
```
[mysqld]
event_scheduler=1
```
to my.cnf to keep scheduler start at mysql server startup
You want to setup a database operation that runs periodically without userintervention.
```
CREATE TABLE mark_log (
ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      message VARCHAR(100)
    );
```

```
CREATE EVENT mark_insert
ON SCHEDULE EVERY 5 MINUTE
DO INSERT INTO mark_log (message) VALUES('-- MARK --');
```

Below is another event to remove the before mark_log
```
CREATE EVENT mark_expire
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM mark_log WHERE ts < NOW() - INTERVAL 2 DAY;
```

## Writing Helper Routines for Executing Dynamic SQL

Prepared SQL statement steps:
```
SET @stmt = CONCAT('CREATE TABLE ',@tbl_name,' (i INT)');
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @stmt = CONCAT('INSERT INTO ',@tbl_name,' (i) VALUES(',@val,')'); PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
```

```
CREATE PROCEDURE exec_stmt(stmt_str TEXT) BEGIN
SET @_stmt_str = stmt_str; PREPARE stmt FROM @_stmt_str; EXECUTE stmt;
DEALLOCATE PREPARE stmt;
END;
```

```
CALL exec_stmt(CONCAT('CREATE TABLE ',@tbl_name,' (i INT)'));
CALL exec_stmt(CONCAT('INSERT INTO ',@tbl_name,' (i) VALUES(',@val,')'));
```

## Handling Errors Within Stored Programs

```
CREATE PROCEDURE us_population() BEGIN
DECLARE done BOOLEAN DEFAULT FALSE;
DECLARE state_pop, total_pop BIGINT DEFAULT 0;
DECLARE cur CURSOR FOR SELECT pop FROM states;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
OPEN cur; fetch_loop: LOOP
FETCH cur INTO state_pop; IF done THEN
LEAVE fetch_loop; END IF;
SET total_pop = total_pop + state_pop; END LOOP;
CLOSE cur;
SELECT total_pop AS 'Total U.S. Population';
END;
```

## Catching and Ignoring Errors

 DROP STATEMENT HAVE A IF EXISTS TO suppress errors.DROP USER can't.
```
CREATE PROCEDURE drop_user(user TEXT, host TEXT)
 BEGIN
  DECLARE account TEXT;
  DECLARE CONTINUE HANDLER FOR 1396
  SELECT CONCAT('Unknown user: ', account) AS Message; SET account = CONCAT(QUOTE(user),'@',QUOTE(host)); CALL exec_stmt(CONCAT('DROP USER ',account));
 END;
```
DECLARE CONTINUE HANDLER FOR 1396 BEGIN END to ignore the error completely

use `SIGNAL` to produce your own errors.
SET sql_mode = 'ERROR_FOR_DIVISION_BY_ZERO,STRICT_ALL_TABLES'

## Using Triggers to Preprocess or Reject Data

CREATE TABLE contact_info (
id INT NOT NULL AUTO_INCREMENT,
name VARCHAR(30),
state CHAR(2),
email VARCHAR(50),
url VARCHAR(255),
PRIMARY KEY (id)
);
CREATE TRIGGER bi_contact_info BEFORE INSERT ON contact_info FOR EACH ROW
BEGIN
IF (SELECT COUNT(*) FROM states WHERE abbrev = NEW.state) = 0 THEN
SIGNAL SQLSTATE 'HY000'
SET MYSQL_ERRNO = 1525, MESSAGE_TEXT = 'invalid state code';
END IF;
IF INSTR(NEW.email,'@') = 0 THEN SIGNAL SQLSTATE 'HY000'
SET MYSQL_ERRNO = 1525, MESSAGE_TEXT = 'invalid email address';
END IF;
SET NEW.url = TRIM(LEADING 'http://' FROM NEW.url);
END;

## Working with Metadata


## Determining the Number of Rows Affected by a Statement

## Accessing Table Column Definitions

INFORMA TION_SCHEMA, from SHOW statements, or from mysqldump
SHOW COLUMNS

# Importing and Exporting Data

`LOAD DATA` and `mysqlimport`, `SELECT ... INTO OUTFILE` as export file
LOAD DATA LOCAL INFILE 'mytbl.txt' INTO TABLE mytbl;
`STARTING BY` to strip characters
ENCLOSED BY
ESCAPED BY

## Handling duplicate key values

When input record duplicates an existing row in the column or columns that form a PRIMARY KEY or UNIQUE index.
Specify IGNORE or REPLACE afte the filename
IGNORE 1 LINES

LOAD DATA LOCAL INFILE 'data.txt' INTO TABLE t -> IGNORE 1 LINES
(@date,@time,@name,@weight_lb,@state)
SET dt = CONCAT(@date,' ',@time),
first_name = SUBSTRING_INDEX(@name,' ',1),
last_name = SUBSTRING_INDEX(@name,' ',-1),
weight_kg = @weight_lb * .454,
st_abbrev = (SELECT abbrev FROM states WHERE name = @state);

## Exporting Query Results from MySQL

SELECT ... INTO OUTFILE
mysql --skip-column-names -e "your statement here" db_name \ | tr "\t" "#" > output_file
SELECT...INTOOUTFILE can not includes columns labels whereas mysql statement can

## Importing and Exporting NULL Values

Treat `\N` as NULL
Think the following confition:
```
str1    13  1997-10-14
str2    -1  2009-05-07
Unknown 15
Unknown -1  1973-07-15
```

LOAD DATA LOCAL INFILE 'has_nulls.txt'
INTO TABLE t (@c1,@c2,@c3)
SET c1 = IF(@c1='Unknown',NULL,@c1),
c2 = IF(@c2=-1,NULL,@c2),
c3 = IF(@c3='',NULL,@c3);

When export mysql to other program:
SELECT...INTOOUTFILEwritesNULLvaluesas\N
IFNULL(col_name,'Unknown')

sed -e "s/NULL/\\N/g" data.txt > tmp
use IFNULL to map NULL values to other value

## Writing Your Own Data Export Programs

## Exchanging Data Between MySQL and Microsoft

## Importing XML into MySQL

Setup an XML parser to read the document, then use the document records to construct and execute INSERT statements

## Guessing Table Structure from a Datafile

Use `SET sql_mode = 'STRICT_ALL_TABLES';` to validate input
`SET sql_mode = 'STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE';` to forbidden zero in date column.

--sql_mode=mode_value to start mysql mode for all clients.
SET GLOBAL sql_mode = 'mode_value'; set global mode at runtime

## Using Patterns to Match Broad Content Types

SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cookbook' AND TABLE_NAME = 'profile'
AND COLUMN_NAME = 'color';

## Managing Multiple Auto-Increment Values Simultaneously

```
INSERT INTO tbl_name (id,...) VALUES(NULL,...);
SET @saved_id = LAST_INSERT_ID();
```

## Using Auto-Increment Values to Associate Tables

```
CREATE TABLE invoice (
  inv_id INT UNSIGNED NOT NULL AUTO_INCREMENT, PRIMARY KEY (inv_id),
  date DATE NOT NULL
);

CREATE TABLE inv_item (
  inv_id INT UNSIGNED NOT NULL, # invoice ID (from invoice table) INDEX (inv_id),
  qty INT, # quantity
  description VARCHAR(40) # description
);

INSERT INTO invoice (inv_id,date) VALUES(NULL,CURDATE());
SET @inv_id = LAST_INSERT_ID();
INSERT INTO inv_item (inv_id,qty,description)
VALUES(@inv_id,1,'hammer');
INSERT INTO inv_item (inv_id,qty,description)
VALUES(@inv_id,3,'nails, box');
INSERT INTO inv_item (inv_id,qty,description)
VALUES(@inv_id,12,'bandage');
```

## Using Sequence Generators as Counters

CREATE TABLE booksales (
  title VARCHAR(60)NOTNULL, #booktitle
  copies INT UNSIGNED NOT NULL, # number of copies sold PRIMARY KEY (title)
);

Methods:

- INSERT INTO booksales (title,copies) VALUES('The Greater Trumps',0);
- INSERT INTO booksales (title,copies) VALUES('The Greater Trumps',LAST_INSERT_ID(1))
  ON DUPLICATE KEY UPDATE copies = LAST_INSERT_ID(copies+1);

## Generating Repeating Sequences

Suppose also that you pack and distribute items 12 units to a box and 6 boxes to a case

retrieve most recently used case, box, and unit numbers
unit = unit + 1
if (unit > 12)
{
unit = 1
box = box + 1 }
if (box > 6) {
box = 1
  case = case + 1
}
%% increment unit number
%% need to start a new box?
%% go to first unit of next box
%% need to start a new case?
%% go to first box of next case
store new case, box, and unit numbers

Alternatively, it’s possible simply to assign each item a sequence number identifier and derive the corresponding case, box, and unit numbers from it. The identifier can come from an AUTO_INCREMENT column or a single-row sequence generator

%% retrieve the unit, box, case
unit_num = ((seq - 1) % 12) + 1
box_num = (int ((seq - 1) / 12) % 6) + 1
case_num = int ((seq - 1)/(6 * 12)) + 1

# Statistics

```
SELECT age, COUNT(score) AS n, -> SUM(score) AS sum,
MIN(score) AS minimum,
MAX(score) AS maximum,
AVG(score) AS mean,
STDDEV_SAMP(score) AS 'std. dev.', -> VAR_SAMP(score) AS 'variance'
FROM testscore
GROUP BY age;
```

Calucate frequence
```
SET @n = (SELECT COUNT(score) FROM testscore);
SELECT score, (COUNT(score)*100)/@n AS percent
FROM testscore GROUP BY score;
```

# Calculating Successive-Row Differences

```
SELECT t1.seq AS seq1, t2.seq AS seq2,
t1.city AS city1, t2.city AS city2,
t1.miles AS miles1, t2.miles AS miles2,
t2.miles-t1.miles AS dist
FROM trip_log AS t1 INNER JOIN trip_log AS t2
ON t1.seq+1 = t2.seq
ORDER BY t1.seq;
```

compare through self-joins

```
SELECT t1.stage, t1.km, t1.t,
SUM(t2.km) AS 'cum. km',
SEC_TO_TIME(SUM(TIME_TO_SEC(t2.t))) AS 'cum. t',
SUM(t2.km)/(SUM(TIME_TO_SEC(t2.t))/(60*60)) AS 'avg. km/hour'
FROM marathon AS t1 INNER JOIN marathon AS t2
ON t1.stage >= t2.stage
GROUP BY t1.stage;
```

## Deal with duplicates

```
CREATE TABLE poll_vote (
  poll_id INT UNSIGNED NOT NULL AUTO_INCREMENT, candidate_id INT UNSIGNED,
  vote_count INTUNSIGNED,
  PRIMARY KEY (poll_id, candidate_id)
);
```

- For the first vote received for a given poll candidate, insert a new row with a vote count of 1.
- For subsequent votes for that candidate, increment the vote count of the existing record.

Neither INSERT IGNORE nor REPLACE are appropriate here because for all votes except the first, you don’t know what the vote count should be. INSERT ... ON DUPLICATE KEY UPDATE works better here

```
INSERT INTO poll_vote (poll_id,candidate_id,vote_count) VALUES(14,3,1)
ON DUPLICATE KEY UPDATE vote_count = vote_count + 1;
```

## COUNTING DUPLICATE ROWS

SELECT COUNT(*) AS rows FROM catalog_list;

SELECT COUNT(*), last_name, first_name
FROM catalog_list
GROUP BY last_name, first_name
HAVING COUNT(*) > 1;

1.Determine which columns contain the values that may be duplicated.
2. List those columns in the column selection list, along with COUNT(*).
3. List the columns in the GROUP BY clause as well.
4. AddaHAVINGclausethateliminatesuniquevaluesbyrequiringgroupcountstobe greater than one.

SELECT COUNT(*), column_list FROM tbl_name
GROUP BY column_list
HAVING COUNT(*) > 1

CREATE TABLE tmp
SELECT COUNT(*) AS count, last_name, first_name FROM catalog_list
GROUP BY last_name, first_name HAVING count > 1;
SELECT catalog_list.*
FROM tmp INNER JOIN catalog_list USING (last_name, first_name) -> ORDER BY last_name, first_name;

## REMOVE DUPLICATE rows

Select the unique rows from the table into a second table then use it to replace the original one.Or use DELETE ... LIMIT n to remove all but one instance of a specific set of duplicate rows.

Before remove consider the conditions:

- Does the method require the table to have a unique index?
- If the columns in which duplicate values occur may contain NULL, will the method
remove duplicate NULL values?
- Does the method prevent duplicates from occurring in the future?

If the rows is duplicate only when the columns is completely the same:
```
CREATE TABLE tmp LIKE catalog_list;
INSERT INTO tmp SELECT DISTINCT * FROM catalog_list;
DROP TABLE catalog_list;
RENAME TABLE tmp TO catalog_list;
```

Or if the row is duplicate only when a subset of the columns.Create the new table has uniuqe index and
select rows into it using INSERT IGNORE and replace the original table with the new one

```
CREATE TABLE tmp LIKE catalog_list;
ALTER TABLE tmp ADD PRIMARY KEY (last_name, first_name);
INSERT IGNORE INTO tmp SELECT * FROM catalog_list;
```

UNIQUE indexes permit multiple NULL values

## Removing duplicates of a particular row

```
SELECT COUNT(*), last_name, first_name
FROM catalog_list
GROUP BY last_name, first_name
HAVING COUNT(*) > 1;
```

```
DELETE FROM catalog_list WHERE last_name = 'Baxter'
AND first_name = 'Wallace' LIMIT 2;
DELETE FROM catalog_list WHERE last_name = 'Pinter'
AND first_name = 'Marlene' LIMIT 1;
SELECT * FROM catalog_list;
```

# Transactions

The transactional engines include InnoDB adn NDB.
To detect the storage engine for supporting transactions:

```
SELECT ENGINE FROM INFORMATION_SCHEMA.ENGINES
WHERE SUPPORT IN ('YES','DEFAULT') AND TRANSACTIONS='YES';
```

If MySQL Cluster is enabled, you’ll also see a line that says ndbcluster.

MySQL normally operate with auto-commit mode.You should disable it while using transactions.
START TRANSACTION to suspend auto-commit mode.
START TRANSACTION; // or SET autocommit = 0;
INSERT INTO t (i) VALUES(1);
COMMIT;
SELECT * FROM t;

block: statement 1 statement 2 ... statement n commit
if the block failed:
  roll back

## Creating Navigation Indexes from Database Content

Two methods:
- A single-page with navigation index that has links pointing to the beginning of each section.
- A multiple-page display consisting of pages that each show the verses form a single chapter


## Store image

- Use LOAD_FILE()
- Write a program reads the image file and constructs INSERT statement

## Generating images for download

Send a Content-Type such as: text/plain, image/jpg, application/pdf or application/msexecel
Content-disposition: attachment; filename="suggested_name" to suggest a name for downloading.

Another way to produce downloadable content is to generate the query result, write it to a file on the server side, compress it, and send the result to the browser. The browser likely will download it and run some kind of uncompress utility to recover the original file.

# Processing Form

SELECT COLUMN_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA='cookbook' AND TABLE_NAME='cow_order' -> AND COLUMN_NAME='size';

# Count the page accessing count

INSERT INTO hitcount (path,hits) VALUES('some path',LAST_INSERT_ID(1)) ON DUPLICATE KEY UPDATE hits = LAST_INSERT_ID(hits+1);
SELECT LAST_INSERT_ID();

# Session Management

In php, to store sessions in MySQL set the routes handles as belows:

`
session_set_save_handler (
  "mysql_sess_open",
  "mysql_sess_close",
  "mysql_sess_read",
  "mysql_sess_write",
  "mysql_sess_destroy",
  "mysql_sess_gc"
);
`

# Account Management

UPDATE mysql.user SET password_expired = 'Y' WHERE User <> ''; FLUSH PRIVILEGES; expires all passwords（while not for anonymous users）

Find weak accounts:
SELECT User, Host, plugin, Password FROM mysql.user
WHERE (plugin = 'mysql_native_password' AND Password = '')
OR plugin IN ('','mysql_old_password');
