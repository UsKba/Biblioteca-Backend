# Migration `20200722142040-create-room`

This migration has been generated by DestroyeerU at 7/22/2020, 2:20:41 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Room" (
"id" SERIAL,"initials" text  NOT NULL ,"status" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE UNIQUE INDEX "Room.initials" ON "public"."Room"("initials")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200718152908-change-user-enrollment-to-string..20200722142040-create-room
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
   id         Int @default(autoincrement()) @id
@@ -13,4 +13,10 @@
   password   String
   name       String
   email      String
 }
+
+model Room {
+  id         Int @default(autoincrement()) @id
+  initials   String @unique
+  status     Int
+}
```

