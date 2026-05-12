/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3174063690")

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": true,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "income",
      "expense"
    ]
  }))

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
      "Transportation",
      "Entertainment",
      "Education",
      "Utilities",
      "Shopping",
      "Others"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3174063690")

  // update field
  collection.fields.addAt(2, new Field({
    "help": "",
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": true,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Income",
      "Expense"
    ]
  }))

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
})
