# Migration `20200718152908-change-user-enrollment-to-string`

This migration has been generated by DestroyeerU at 7/18/2020, 3:29:08 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."User" ALTER COLUMN "enrollment" SET DATA TYPE text ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200718151010-add-unique-to-user-enrollment..20200718152908-change-user-enrollment-to-string
--- datamodel.dml
+++ datamodel.dml
@@ -3,14 +3,14 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 model User {
   id         Int @default(autoincrement()) @id
-  enrollment Int @unique
+  enrollment String @unique
   password   String
   name       String
   email      String
 }
```


