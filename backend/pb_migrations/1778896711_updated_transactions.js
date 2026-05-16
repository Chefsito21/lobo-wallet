/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3174063690")

  // update field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2324088501",
    "help": "",
    "hidden": false,
    "id": "relation3284180135",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "account",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3174063690")

  // update field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2324088501",
    "help": "",
    "hidden": false,
    "id": "relation3284180135",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "accout",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
