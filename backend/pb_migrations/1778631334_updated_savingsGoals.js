/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_592782094")

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "date3074913522",
    "max": "",
    "min": "",
    "name": "deadline",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_592782094")

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "date3074913522",
    "max": "",
    "min": "",
    "name": "deadline",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
