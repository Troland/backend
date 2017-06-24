<?php
#leap year
$year = substr ($date, 0, 4);
$is_leap=($year%4==0)&&($year%100!=0||$year%400==0);
# or use date() function
date_default_timezone_set ("UTC");
$is_leap = date ("L", strtotime ($date));
 ?>
