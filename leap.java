int year = Integer.valueOf (date.substring (0, 4)).intValue ();
booleanis_leap=(year%4==0)&&(year%100!=0||year%400==0);
