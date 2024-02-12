CREATE TABLE Users(
    user_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    points INTEGER
);

CREATE TABLE Achievements(
    achievement_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    user_ID INTEGER,
    FOREIGN KEY (user_ID) REFERENCES Users(user_ID)
);