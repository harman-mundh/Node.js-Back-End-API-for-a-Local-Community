CREATE TABLE issueCategories (
  issueID INT NOT NULL,
  categoryID INT NOT NULL,
  FOREIGN KEY (issueID) REFERENCES issues (ID) ON DELETE CASCADE,
  FOREIGN KEY (categoryID) REFERENCES categories (ID) ON DELETE CASCADE,
  PRIMARY KEY (issueID, categoryID)
);
