DELIMITER $$

CREATE TRIGGER delete_old_weather_cache
BEFORE INSERT ON weather_cache
FOR EACH ROW 
BEGIN
    DELETE FROM weather_cache WHERE TIMESTAMPDIFF(HOUR, last_updated, NOW()) >= 24;
END$$

DELIMITER ;