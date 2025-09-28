import Database from 'better-sqlite3'
import GlobalValueManager from './GlobalValueManager'
import path from 'node:path'

const db = new Database(path.resolve(GlobalValueManager.userDataPath, 'database.db'))
db.prepare(
  `CREATE TABLE IF NOT EXISTS tag_table (
    fileid TEXT not null,
    tag TEXT not null,
    PRIMARY KEY (fileid, tag)
    );`
).run()

export const insertTag = db.prepare(`INSERT INTO tag_table (fileid, tag) VALUES (?, ?);`)
export const getTags = db.prepare(`SELECT tag FROM tag_table WHERE fileid = ?;`)
export const deleteTags = db.prepare(`DELETE FROM tag_table WHERE fileid = ?;`)

db.prepare(
  `CREATE TABLE IF NOT EXISTS attr_table (
    fileid TEXT not null,
    attrid INTEGER not null,
    PRIMARY KEY (fileid, attrid)
    );`
).run()

export const insertAttrId = db.prepare(`INSERT INTO attr_table (fileid, attrid) VALUES (?, ?);`)
export const getAttrIds = db.prepare(`SELECT attrid FROM attr_table WHERE fileid = ?;`)
export const deleteAttrId = db.prepare(`DELETE FROM attr_table WHERE fileid = ?;`)

export function storeTagAttr(fileId, tags, attrIds) {
  deleteTags(fileId)
  deleteAttrId(fileId)
  tags.forEach((tag) => {
    insertTag.run(fileId, tag)
  })
  attrIds.forEach((attrId) => {
    insertAttrId(fileId, attrId)
  })
}
