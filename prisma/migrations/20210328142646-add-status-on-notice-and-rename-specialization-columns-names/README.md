# Migration `20210328142646-add-status-on-notice-and-rename-specialization-columns-names`

This migration has been generated by DestroyeerU at 3/28/2021, 2:26:46 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."new_Notice" (
"content" TEXT NOT NULL  ,"createdAt" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP ,"expiredAt" DATE NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"imageCode" INTEGER NOT NULL  ,"status" INTEGER NOT NULL  ,"title" TEXT NOT NULL  ,"userCreatorId" INTEGER NOT NULL  ,FOREIGN KEY ("userCreatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

INSERT INTO "quaint"."new_Notice" ("content", "createdAt", "expiredAt", "id", "imageCode", "title", "userCreatorId") SELECT "content", "createdAt", "expiredAt", "id", "imageCode", "title", "userCreatorId" FROM "quaint"."Notice"

PRAGMA foreign_keys=off;
DROP TABLE "quaint"."Notice";;
PRAGMA foreign_keys=on

ALTER TABLE "quaint"."new_Notice" RENAME TO "Notice";

CREATE TABLE "quaint"."new_NoticeRoom" (
"noticeId" INTEGER NOT NULL  ,"roomId" INTEGER NOT NULL  ,"roomStatus" INTEGER NOT NULL  ,
    PRIMARY KEY ("noticeId"),FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE)

INSERT INTO "quaint"."new_NoticeRoom" ("noticeId", "roomId") SELECT "noticeId", "roomId" FROM "quaint"."NoticeRoom"

PRAGMA foreign_keys=off;
DROP TABLE "quaint"."NoticeRoom";;
PRAGMA foreign_keys=on

ALTER TABLE "quaint"."new_NoticeRoom" RENAME TO "NoticeRoom";

CREATE TABLE "quaint"."new_NoticeComputer" (
"computerId" INTEGER NOT NULL  ,"computerStatus" INTEGER NOT NULL  ,"noticeId" INTEGER NOT NULL  ,
    PRIMARY KEY ("noticeId"),FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("computerId") REFERENCES "Computer"("id") ON DELETE CASCADE ON UPDATE CASCADE)

INSERT INTO "quaint"."new_NoticeComputer" ("computerId", "noticeId") SELECT "computerId", "noticeId" FROM "quaint"."NoticeComputer"

PRAGMA foreign_keys=off;
DROP TABLE "quaint"."NoticeComputer";;
PRAGMA foreign_keys=on

ALTER TABLE "quaint"."new_NoticeComputer" RENAME TO "NoticeComputer";

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210327165317-create-notice-computer..20210328142646-add-status-on-notice-and-rename-specialization-columns-names
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
@@ -180,14 +180,16 @@
   title     String
   content   String
   imageCode Int
+  status    Int
   createdAt DateTime @default(now())
   expiredAt DateTime
-  userCreator    User             @relation(fields: [userCreatorId], references: [id])
-  userCreatorId  Int
+  userCreator   User @relation(fields: [userCreatorId], references: [id])
+  userCreatorId Int
+
   NoticeRoom     NoticeRoom[]
   NoticeComputer NoticeComputer[]
 }
@@ -197,9 +199,9 @@
   room   Room @relation(fields: [roomId], references: [id])
   roomId Int
-  status Int
+  roomStatus Int
   @@id([noticeId])
 }
@@ -209,8 +211,8 @@
   computer   Computer @relation(fields: [computerId], references: [id])
   computerId Int
-  status Int
+  computerStatus Int
   @@id([noticeId])
 }
```


