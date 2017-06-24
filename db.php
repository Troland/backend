<?php
# Set the default fetch mode for all statements executed within a connection
$dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

# set the mode for a given statement, call its setFetchMode() method after executing the statement and before fetching the results
$sth->setFetchMode(PDO::FETCH_OBJ);

?>
