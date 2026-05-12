/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3174063690")

  // update field
  collection.fields.addAt(4, new Field({
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
      "Transporte",
      "Entretenimiento",
      "Educación",
      "Compras",
      "Otros"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3174063690")

  // update field
  collection.fields.addAt(4, new Field({
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
      "Comida",
      "Transporte",
      "Entretenimiento",
      "Educación",
      "Compras",
      "Otros"
    ]
  }))

  return app.save(collection)
})
