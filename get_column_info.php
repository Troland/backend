<?php
#@ _GET_COLUMN_INFO_
function get_column_info ($dbh, $db_name, $tbl_name)
{
  $stmt = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
  $sth = $dbh->prepare ($stmt);
  $sth->execute (array ($db_name, $tbl_name));
  $col_info = array();
  while ($row = $sth->fetch (PDO::FETCH_ASSOC))
    $col_info[$row["COLUMN_NAME"]] = $row;
  return ($col_info);
}
 ?>
