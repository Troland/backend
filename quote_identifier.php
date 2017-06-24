<?php
# CREATE TABLE `some table` (i INT);If identifier has empty character or others use backticks.
function quote_identifier ($ident) {
  return ('`' . str_replace('`', '``', $ident) . '`');
}
 ?>
