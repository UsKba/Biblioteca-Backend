# Migration `20201129094532-add-status-on-invite`

This migration has been generated by kaduco19 at 11/29/2020, 9:45:33 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."new_Invite" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"receiverId" INTEGER NOT NULL  ,"senderId" INTEGER NOT NULL  ,"status" INTEGER NOT NULL  ,FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

INSERT INTO "quaint"."new_Invite" ("id", "receiverId", "senderId") SELECT "id", "receiverId", "senderId" FROM "quaint"."Invite"

PRAGMA foreign_keys=off;
DROP TABLE "quaint"."Invite";;
PRAGMA foreign_keys=on

ALTER TABLE "quaint"."new_Invite" RENAME TO "Invite";

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201108153402-add-name-on-reserve..20201129094532-add-status-on-invite
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
@@ -33,9 +33,10 @@
   userId2 Int
 }
 model Invite {
-  id Int @id @default(autoincrement())
+  id     Int @id @default(autoincrement())
+  status Int
   UserSender   User @relation("sender", fields: [senderId], references: [id])
   UserReceiver User @relation("receiver", fields: [receiverId], references: [id])
```


