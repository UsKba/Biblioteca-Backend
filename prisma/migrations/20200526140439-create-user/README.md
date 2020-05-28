# Migration `20200526140439-create-user`

This migration has been generated by DestroyeerU at 5/26/2020, 2:04:39 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"age" integer  NOT NULL ,"id" SERIAL,"name" text  NOT NULL ,
    PRIMARY KEY ("id"))
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200526140439-create-user
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,14 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
+}
+
+model User {
+  id   Int    @default(autoincrement()) @id
+  name String
+  age  Int
+}
```

