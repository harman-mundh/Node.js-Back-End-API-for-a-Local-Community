CREATE TABLE articleViews (
  articleId INT NOT NULL,
  viewTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (articleId) REFERENCES articles (ID) ON DELETE CASCADE
);
