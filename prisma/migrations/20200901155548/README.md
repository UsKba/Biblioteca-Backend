# Migration `20200901155548`

This migration has been generated by DestroyeerU at 9/1/2020, 3:55:49 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200831150055-chage-date-to-day-month-year-on-reserve..20200901155548
--- datamodel.dml
+++ datamodel.dml
@@ -3,16 +3,16 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model User {
   id          Int           @default(autoincrement()) @id
   enrollment  String        @unique
   name        String
-  email       String
+  email       String        @unique
   UserReserve UserReserve[]
 }
 model Room {
@@ -50,5 +50,5 @@
   userId Int
   reserve   Reserve @relation(fields: [reserveId], references: [id])
   reserveId Int
-}
+}
```

