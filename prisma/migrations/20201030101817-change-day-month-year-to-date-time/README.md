# Migration `20201030101817-change-day-month-year-to-date-time`

This migration has been generated by kaduco19 at 10/30/2020, 10:18:17 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."new_Reserve" (
"date" DATE NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"roomId" INTEGER NOT NULL  ,"scheduleId" INTEGER NOT NULL  ,FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE)

INSERT INTO "quaint"."new_Reserve" ("id", "roomId", "scheduleId") SELECT "id", "roomId", "scheduleId" FROM "quaint"."Reserve"

PRAGMA foreign_keys=off;
DROP TABLE "quaint"."Reserve";;
PRAGMA foreign_keys=on

ALTER TABLE "quaint"."new_Reserve" RENAME TO "Reserve";

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201023164145-data-base-changed-to-sqlite..20201030101817-change-day-month-year-to-date-time
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "sqlite"
-  url = "***"
+  url = "***"
 }
 model User {
   id         Int    @id @default(autoincrement())
@@ -49,12 +49,10 @@
   UserReserve UserReserve[]
 }
 model Reserve {
-  id    Int @id @default(autoincrement())
-  day   Int
-  month Int
-  year  Int
+  id   Int      @id @default(autoincrement())
+  date DateTime
   Room     Room     @relation(fields: [roomId], references: [id])
   Schedule Schedule @relation(fields: [scheduleId], references: [id])
```


