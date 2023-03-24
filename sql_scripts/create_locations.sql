CREATE TABLE locations (
    ID INT NOT NULL AUTO_INCREMENT,
    latitude DECIMAL(8,6),
    longitude DECIMAL(9,6),
    issueID INT,
    meetingID INT,
    PRIMARY KEY (ID),
    FOREIGN KEY (issueID) REFERENCES issues (ID) ON DELETE CASCADE,
    FOREIGN KEY (meetingID) REFERENCES meetings (ID) ON DELETE CASCADE
);