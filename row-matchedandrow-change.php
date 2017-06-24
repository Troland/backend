<?php
// PDO::MYSQL_ATTR_FOUND_ROWS => 1 会输出rows-matched 就是凡是被查询到的均返回而不是只返回改变了值的行
$dsn = "mysql:host=localhost;dbname=cookbook";
$dbh = new PDO ($dsn, "cbuser", "cbpass",
                array (PDO::MYSQL_ATTR_FOUND_ROWS => 1));
$dbh = Cookbook::connect ();
$stmt = 'UPDATE profile SET cats = 0 WHERE cats = 0';
$sth = $dbh->prepare($stmt);
$sth.execute();
printf ("Number of rows updated: %d\n", $sth->rowCount());
 ?>
