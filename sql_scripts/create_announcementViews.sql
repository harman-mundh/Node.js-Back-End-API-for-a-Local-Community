CREATE TABLE announcementViews (
  announcementId INT NOT NULL,
  viewTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (announcementId) REFERENCES announcements (ID) ON DELETE CASCADE
);
