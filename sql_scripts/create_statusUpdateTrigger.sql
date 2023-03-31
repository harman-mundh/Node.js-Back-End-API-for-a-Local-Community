DELIMITER $$

CREATE TRIGGER update_issue_status
BEFORE UPDATE ON issues
FOR EACH ROW 
BEGIN
  IF NEW.status = 'New' AND TIMESTAMPDIFF(HOUR, NEW.dateCreated, NOW()) >= 24 THEN
    SET NEW.status = 'Work in progress';
  END IF;

END$$

DELIMITER ;