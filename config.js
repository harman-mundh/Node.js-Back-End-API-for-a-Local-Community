exports.config = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "codio",
    database: process.env.DB_DATABASE || "local_community",
    connection_limit: 100
  }