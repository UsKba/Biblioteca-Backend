# Migration `20201023164145-data-base-changed-to-sqlite`

This migration has been generated at 10/23/2020, 4:41:45 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
PRAGMA foreign_keys=OFF;

CREATE TABLE "quaint"."User" (
"email" TEXT NOT NULL  ,"enrollment" TEXT NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"name" TEXT NOT NULL  )

CREATE TABLE "quaint"."Friend" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"userId1" INTEGER NOT NULL  ,"userId2" INTEGER NOT NULL  ,FOREIGN KEY ("userId1") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("userId2") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE TABLE "quaint"."Invite" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"receiverId" INTEGER NOT NULL  ,"senderId" INTEGER NOT NULL  ,FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE TABLE "quaint"."Role" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"name" TEXT NOT NULL  ,"slug" TEXT NOT NULL  )

CREATE TABLE "quaint"."Reserve" (
"day" INTEGER NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"month" INTEGER NOT NULL  ,"roomId" INTEGER NOT NULL  ,"scheduleId" INTEGER NOT NULL  ,"year" INTEGER NOT NULL  ,FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE TABLE "quaint"."UserReserve" (
"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"reserveId" INTEGER NOT NULL  ,"roleId" INTEGER NOT NULL  ,"userId" INTEGER NOT NULL  ,FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE TABLE "quaint"."Room" (
"available" BOOLEAN NOT NULL DEFAULT true ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"initials" TEXT NOT NULL  )

CREATE TABLE "quaint"."Schedule" (
"endHour" TEXT NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"initialHour" TEXT NOT NULL  ,"periodId" INTEGER NOT NULL  ,FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE)

CREATE TABLE "quaint"."Period" (
"endHour" TEXT NOT NULL  ,"id" INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,"initialHour" TEXT NOT NULL  ,"name" TEXT NOT NULL  )

CREATE UNIQUE INDEX "quaint"."User.enrollment" ON "User"("enrollment")

CREATE UNIQUE INDEX "quaint"."User.email" ON "User"("email")

CREATE UNIQUE INDEX "quaint"."Room.initials" ON "Room"("initials")

PRAGMA "quaint".foreign_key_check;

PRAGMA foreign_keys=ON;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201016152701-create-role..20201023164145-data-base-changed-to-sqlite
--- datamodel.dml
+++ datamodel.dml
@@ -1,105 +1,105 @@
-generator client {
-  provider = "prisma-client-js"
-}
-
-datasource db {
-  provider = "postgresql"
-  url = "***"
-}
-
-model User {
-  id         Int    @id @default(autoincrement())
-  enrollment String @unique
-  email      String @unique
-  name       String
-
-  FriendUser1 Friend[] @relation("user1")
-  FriendUser2 Friend[] @relation("user2")
-
-  InviteSender   Invite[] @relation("sender")
-  InviteReceiver Invite[] @relation("receiver")
-
-  UserReserve UserReserve[]
-}
-
-model Friend {
-  id Int @id @default(autoincrement())
-
-  User1 User @relation("user1", fields: [userId1], references: [id])
-  User2 User @relation("user2", fields: [userId2], references: [id])
-
-  userId1 Int
-  userId2 Int
-}
-
-model Invite {
-  id Int @id @default(autoincrement())
-
-  UserSender   User @relation("sender", fields: [senderId], references: [id])
-  UserReceiver User @relation("receiver", fields: [receiverId], references: [id])
-
-  senderId   Int
-  receiverId Int
-}
-
-model Role {
-  id          Int           @id @default(autoincrement())
-  name        String
-  slug        String
-  UserReserve UserReserve[]
-}
-
-model Reserve {
-  id    Int @id @default(autoincrement())
-  day   Int
-  month Int
-  year  Int
-
-  Room     Room     @relation(fields: [roomId], references: [id])
-  Schedule Schedule @relation(fields: [scheduleId], references: [id])
-
-  roomId     Int
-  scheduleId Int
-
-  UserReserve UserReserve[]
-}
-
-model UserReserve {
-  id Int @id @default(autoincrement())
-
-  User    User    @relation(fields: [userId], references: [id])
-  Reserve Reserve @relation(fields: [reserveId], references: [id])
-  Role    Role    @relation(fields: [roleId], references: [id])
-
-  userId    Int
-  reserveId Int
-  roleId    Int
-}
-
-model Room {
-  id        Int     @id @default(autoincrement())
-  initials  String  @unique
-  available Boolean @default(true)
-
-  Reserve Reserve[]
-}
-
-model Schedule {
-  id          Int    @id @default(autoincrement())
-  initialHour String
-  endHour     String
-
-  Period   Period @relation(fields: [periodId], references: [id])
-  periodId Int
-
-  Reserve Reserve[]
-}
-
-model Period {
-  id          Int    @id @default(autoincrement())
-  name        String
-  initialHour String
-  endHour     String
-
-  Schedule Schedule[]
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "sqlite"
+  url = "***"
+}
+
+model User {
+  id         Int    @id @default(autoincrement())
+  enrollment String @unique
+  email      String @unique
+  name       String
+
+  FriendUser1 Friend[] @relation("user1")
+  FriendUser2 Friend[] @relation("user2")
+
+  InviteSender   Invite[] @relation("sender")
+  InviteReceiver Invite[] @relation("receiver")
+
+  UserReserve UserReserve[]
+}
+
+model Friend {
+  id Int @id @default(autoincrement())
+
+  User1 User @relation("user1", fields: [userId1], references: [id])
+  User2 User @relation("user2", fields: [userId2], references: [id])
+
+  userId1 Int
+  userId2 Int
+}
+
+model Invite {
+  id Int @id @default(autoincrement())
+
+  UserSender   User @relation("sender", fields: [senderId], references: [id])
+  UserReceiver User @relation("receiver", fields: [receiverId], references: [id])
+
+  senderId   Int
+  receiverId Int
+}
+
+model Role {
+  id          Int           @id @default(autoincrement())
+  name        String
+  slug        String
+  UserReserve UserReserve[]
+}
+
+model Reserve {
+  id    Int @id @default(autoincrement())
+  day   Int
+  month Int
+  year  Int
+
+  Room     Room     @relation(fields: [roomId], references: [id])
+  Schedule Schedule @relation(fields: [scheduleId], references: [id])
+
+  roomId     Int
+  scheduleId Int
+
+  UserReserve UserReserve[]
+}
+
+model UserReserve {
+  id Int @id @default(autoincrement())
+
+  User    User    @relation(fields: [userId], references: [id])
+  Role    Role    @relation(fields: [roleId], references: [id])
+  Reserve Reserve @relation(fields: [reserveId], references: [id])
+
+  userId    Int
+  roleId    Int
+  reserveId Int
+}
+
+model Room {
+  id        Int     @id @default(autoincrement())
+  initials  String  @unique
+  available Boolean @default(true)
+
+  Reserve Reserve[]
+}
+
+model Schedule {
+  id          Int    @id @default(autoincrement())
+  initialHour String
+  endHour     String
+
+  Period   Period @relation(fields: [periodId], references: [id])
+  periodId Int
+
+  Reserve Reserve[]
+}
+
+model Period {
+  id          Int    @id @default(autoincrement())
+  name        String
+  initialHour String
+  endHour     String
+
+  Schedule Schedule[]
 }
```


