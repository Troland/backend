# numerator / divisor, if divisor is zeor, produce error
CREATE FUNCTION divide(numerator FLOAT, divisor FLOAT) RETURNS FLOAT DETERMINISTIC
BEGIN
IF divisor = 0 THEN SIGNAL SQLSTATE '22012'
SET MYSQL_ERRNO = 1365, MESSAGE_TEXT = 'unexpected 0 divisor'; END IF;
RETURN numerator / divisor; END;
