# Migration `20201108153402-add-name-on-reserve`

This migration has been generated by kaduco19 at 11/8/2020, 3:34:02 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."new_Reserve" (
"adminId" INTEGER NOT NULL  ,"date" DATE NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"name" TEXT NOT NULL  ,"roomId" INTEGER NOT NULL  ,"scheduleId" INTEGER NOT NULL  ,FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

INSERT INTO "quaint"."new_Reserve" ("adminId", "date", "id", "roomId", "scheduleId") SELECT "adminId", "date", "id", "roomId", "scheduleId" FROM "quaint"."Reserve"

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
migration 20201108091449-change-role-to-admin-id-on-reserve..20201108153402-add-name-on-reserve
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
@@ -44,8 +44,9 @@
 }
 model Reserve {
   id   Int      @id @default(autoincrement())
+  name String
   date DateTime
   Room     Room     @relation(fields: [roomId], references: [id])
   Schedule Schedule @relation(fields: [scheduleId], references: [id])
```

