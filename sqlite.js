const sqlite3 = require('sqlite3').verbose();

// open database in memory
let db = new sqlite3.Database('./ielts-reading.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');firebase login
// });

function init() {
  return new Promise((resolve, reject) => {
    db.serialize(function () {
      // level table
      run(`CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(255),
      name VARCHAR(255),
      level VARCHAR(255),
      description TEXT
    )`);
      // groups table
      run(`CREATE TABLE IF NOT EXISTS groups (
      slug VARCHAR(255),
      levelSlug VARCHAR(255),
      name VARCHAR(255),
      description TEXT
    )`);
      // lecture
      run(`CREATE TABLE IF NOT EXISTS lectures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug VARCHAR(255),
      levelSlug VARCHAR(255),
      groupSlug VARCHAR(255),
      title VARCHAR(255),
      details TEXT,
      photoUrl TEXT,
      audioUrl TEXT,
      type VARCHAR(255),
      transcript TEXT,
      translate TEXT
    )`);
      resolve()
    })
  })
}

function insertBulk(tableName, items) {
  // console.log(tableName, items.isEmpty());
  return new Promise((resolve, reject) => {
    if (!tableName || !items) {
      reject('Require param!!!')
    }
    db.serialize(function () {
      // get object-key as array
      // toString is separate element by comma
      keys = Object.keys(items[0])
      const sql = `INSERT INTO ${tableName}(${keys.toString()}) VALUES (${keys.map(key => '?').toString()})`;
      // var stmt2 = db.prepare("INSERT INTO group(slug, levelSlug, name, desciption) VALUES (?, ?, ?, ?)");
      var stmt = db.prepare(sql);
      console.log(`query -------->`, sql)
      for (item of items) {
        stmt.run(Object.values(item));
      }
      stmt.finalize((error) => {
        console.log('finalize is error:', error || 'No')
      });
      resolve()
    })
  })
}


function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err, result) {
      if (err) {
        console.log('Error running sql ' + sql)
        console.log(err)
        return reject(err)
      } else {
        return resolve({ result })
      }
    })
  })
}

function query(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, function (err, row) {
      if (err) {
        return reject(err)
      } else {
        return resolve(row)
      }
    });
  });
}

async function getLevels() {
  const sql = `SELECT * FROM levels`
  return query(sql)
}

async function getGroupsByLevelSlug(levelSlug) {
  const sql = `SELECT * FROM groups WHERE levelSlug="${levelSlug}"`;
  return query(sql)
}

async function getLectureByGroupSlug(groupSlug) {
  const sql = `SELECT * FROM lectures WHERE groupSlug="${groupSlug}"`;
  return query(sql)
}

module.exports = {
  init,
  getLevels,
  getGroupsByLevelSlug,
  getLectureByGroupSlug,
  insertBulk
}