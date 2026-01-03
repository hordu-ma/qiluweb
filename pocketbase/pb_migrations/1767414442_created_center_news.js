/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "center_news_collection",
    "created": "2026-01-03 04:27:22.365Z",
    "updated": "2026-01-03 04:27:22.365Z",
    "name": "center_news",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "field_title",
        "name": "title",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "field_summary",
        "name": "summary",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "field_body",
        "name": "body",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "field_status",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "draft",
            "published"
          ]
        }
      },
      {
        "system": false,
        "id": "field_publish_at",
        "name": "publish_at",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "field_images",
        "name": "images",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
          ],
          "thumbs": [],
          "maxSelect": 10,
          "maxSize": 5242880,
          "protected": false
        }
      }
    ],
    "indexes": [
      "CREATE INDEX idx_status ON center_news (status)",
      "CREATE INDEX idx_publish_at ON center_news (publish_at)"
    ],
    "listRule": "status = 'published'",
    "viewRule": "status = 'published'",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("center_news_collection");

  return dao.deleteCollection(collection);
})
