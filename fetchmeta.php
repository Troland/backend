<?php
// fetch column meta
$stmt = "SELECT name, birth FROM profile"; print ("Statement: $stmt\n");
$sth = $dbh->prepare ($stmt); $sth->execute ();
    # metadata information becomes available at this point ...
$ncols = $sth->columnCount ();
print ("Number of columns: $ncols\n"); if ($ncols == 0)
print ("Note: statement has no result set\n"); for ($i = 0; $i < $ncols; $i++)
{
$col_info = $sth->getColumnMeta ($i);
$flags = implode (",", array_values ($col_info["flags"])); printf ("--- Column %d (%s) ---\n", $i, $col_info["name"]); printf ("pdo_type: %d\n", $col_info["pdo_type"]); printf ("native_type: %s\n", $col_info["native_type"]);
}
 ?>
