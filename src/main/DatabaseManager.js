/**
 * This file handles a local database which stores file tag and attribute settings.
 */
import Database from 'better-sqlite3'
import GlobalValueManager from './GlobalValueManager'
import path from 'node:path'

class DatabaseManager {
  constructor() {
    this.init()
  }
  init() {
    this.db = Database(path.resolve(GlobalValueManager.userDataPath, 'database.db'))
    // Tags
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS tag_table (
        fileid TEXT not null,
        tag TEXT not null,
        PRIMARY KEY (fileid, tag)
        );`
      )
      .run()
    this.insertTag = this.db.prepare(`INSERT INTO tag_table (fileid, tag) VALUES (?, ?);`)
    this.getTags = this.db.prepare(`SELECT tag FROM tag_table WHERE fileid = ?;`)
    this.deleteTags = this.db.prepare(`DELETE FROM tag_table WHERE fileid = ?;`)
    // Attributes
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS attr_table (
        fileid TEXT not null,
        attrid INTEGER not null,
        PRIMARY KEY (fileid, attrid)
        );`
      )
      .run()
    this.insertAttrId = this.db.prepare(`INSERT INTO attr_table (fileid, attrid) VALUES (?, ?);`)
    this.getAttrIds = this.db.prepare(`SELECT attrid FROM attr_table WHERE fileid = ?;`)
    this.deleteAttrId = this.db.prepare(`DELETE FROM attr_table WHERE fileid = ?;`)
  }

  getTagsOfFile(fileId) {
    return this.getTags.all(fileId)
  }

  getAttrIdsOfFile(fileId) {
    return this.getAttrIds.all(fileId)
  }

  storeTagAttr(fileId, tags, attrIds) {
    this.deleteTags.run(fileId)
    this.deleteAttrId.run(fileId)
    tags.forEach((tag) => {
      this.insertTag.run(fileId, tag)
    })
    attrIds.forEach((attrId) => {
      this.insertAttrId.run(fileId, attrId)
    })
  }
}

export default DatabaseManager
