// Put your database code here
// This ensures that things do not fail silently but will throw errors instead.
"use strict";
// Require better-sqlite.
const Database = require('better-sqlite3');

//Connect to a db or create one if not exist yet
const db = new Database('log.db');
const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)

let row = stmt.get();
if(row === undefined){
    console.log("Database appears to be empty. Initializing immediately...");

    const sqlInit = `
        CREATE TABLE accesslog(
            id INTEGER PRIMARY KEY,
            remoteaddr TEXT,
            remoteuser TEXT,
            time TEXT,
            method TXT,
            url TEXT,
            protocol TEXT,
            httpversion TEXT,
            status TEXT,
            referrer TEXT,
            useragent TEXT
        );
    `
    // Insert into the userinfo 
    db.exec(sqlInit);
    console.log("New info added sucessfully.")
}else{
    console.log("Log database exists.");
}

//export module to be used in other places
module.exports = db;  