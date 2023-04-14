DELIMITER $$

CREATE EVENT delete_old_weather_cache
  ON SCHEDULE EVERY 24 HOUR
  DO
  BEGIN
    DELETE FROM weather_cache WHERE TIMESTAMPDIFF(HOUR, last_updated, NOW()) >= 24;
END$$

DELIMITER ;