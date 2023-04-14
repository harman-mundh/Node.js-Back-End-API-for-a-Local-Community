DELIMITER $$

CREATE EVENT update_issue_status
  ON SCHEDULE EVERY 1 HOUR
  DO
  BEGIN
    UPDATE issues
    SET status = 'Work in progress'
    WHERE status = 'New' AND TIMESTAMPDIFF(HOUR, dateCreated, NOW()) >= 24;
END$$

DELIMITER ;

-- SET GLOBAL event_scheduler = ON;