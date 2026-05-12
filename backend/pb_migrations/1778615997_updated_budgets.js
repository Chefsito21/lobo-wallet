/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1308224162")

  // remove field
  collection.fields.removeById("text105650625")

  // add field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select105650625",
    "maxSelect": 0,
    "name": "category",
    "presentable": true,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Food",
      "Transportation",
      "Entertainment",
      "Education",
      "Utilities",
      "Shopping",
      "Other"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1308224162")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text105650625",
    "max": 0,
    "min": 0,
    "name": "category",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("select105650625")

  return app.save(collection)
})
