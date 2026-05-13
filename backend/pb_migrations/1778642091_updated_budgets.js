/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1308224162")

  // remove field
  collection.fields.removeById("select105650625")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3292755704",
    "help": "",
    "hidden": false,
    "id": "relation105650625",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "category",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1308224162")

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

  // remove field
  collection.fields.removeById("relation105650625")

  return app.save(collection)
})
