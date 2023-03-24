CREATE TABLE issues (
      ID INT NOT NULL AUTO_INCREMENT,  
      title VARCHAR(32) NOT NULL,  
      allText TEXT NOT NULL,
      summary TEXT,
      dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      dateModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      imageURL VARCHAR(2048),  
      published BOOL NOT NULL DEFAULT 0,
      authorID INT NOT NULL,
      status ENUM('New', 'Work in progress', 'Solved') NOT NULL,
      PRIMARY KEY (ID),
      FOREIGN KEY (authorID) REFERENCES users (ID) ON DELETE CASCADE
);
