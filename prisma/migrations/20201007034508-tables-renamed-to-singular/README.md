# Migration `20201007034508-tables-renamed-to-singular`

This migration has been generated by DestroyeerU at 10/7/2020, 3:45:08 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
"email" text  NOT NULL ,"enrollment" text  NOT NULL ,"id" SERIAL,"name" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Friend" (
"id" SERIAL,"userId1" integer  NOT NULL ,"userId2" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Invite" (
"id" SERIAL,"recipientId" integer  NOT NULL ,"userId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Reserve" (
"day" integer  NOT NULL ,"id" SERIAL,"month" integer  NOT NULL ,"roomId" integer  NOT NULL ,"scheduleId" integer  NOT NULL ,"year" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."UserReserve" (
"id" SERIAL,"reserveId" integer  NOT NULL ,"userId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Room" (
"available" boolean  NOT NULL DEFAULT true,"id" SERIAL,"initials" text  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Schedule" (
"endHour" text  NOT NULL ,"id" SERIAL,"initialHour" text  NOT NULL ,"periodId" integer  NOT NULL ,
    PRIMARY KEY ("id"))

CREATE TABLE "public"."Period" (
"endHour" text  NOT NULL ,"id" SERIAL,"initialHour" text  NOT NULL ,"name" text  NOT NULL ,
    PRIMARY KEY ("id"))

ALTER TABLE "public"."Friends" DROP CONSTRAINT IF EXiSTS "Friends_userId1_fkey";

ALTER TABLE "public"."Friends" DROP CONSTRAINT IF EXiSTS "Friends_userId2_fkey";

ALTER TABLE "public"."Invites" DROP CONSTRAINT IF EXiSTS "Invites_recipientId_fkey";

ALTER TABLE "public"."Invites" DROP CONSTRAINT IF EXiSTS "Invites_userId_fkey";

ALTER TABLE "public"."Reserves" DROP CONSTRAINT IF EXiSTS "Reserves_roomId_fkey";

ALTER TABLE "public"."Reserves" DROP CONSTRAINT IF EXiSTS "Reserves_scheduleId_fkey";

ALTER TABLE "public"."Schedules" DROP CONSTRAINT IF EXiSTS "Schedules_periodId_fkey";

ALTER TABLE "public"."UserReserves" DROP CONSTRAINT IF EXiSTS "UserReserves_reserveId_fkey";

ALTER TABLE "public"."UserReserves" DROP CONSTRAINT IF EXiSTS "UserReserves_userId_fkey";

CREATE UNIQUE INDEX "User.enrollment" ON "public"."User"("enrollment")

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")

CREATE UNIQUE INDEX "Room.initials" ON "public"."Room"("initials")

ALTER TABLE "public"."Friend" ADD FOREIGN KEY ("userId1")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Friend" ADD FOREIGN KEY ("userId2")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Invite" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Invite" ADD FOREIGN KEY ("recipientId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Reserve" ADD FOREIGN KEY ("roomId")REFERENCES "public"."Room"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Reserve" ADD FOREIGN KEY ("scheduleId")REFERENCES "public"."Schedule"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."UserReserve" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."UserReserve" ADD FOREIGN KEY ("reserveId")REFERENCES "public"."Reserve"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."Schedule" ADD FOREIGN KEY ("periodId")REFERENCES "public"."Period"("id") ON DELETE CASCADE  ON UPDATE CASCADE

DROP TABLE "public"."Friends";

DROP TABLE "public"."Invites";

DROP TABLE "public"."Periods";

DROP TABLE "public"."Reserves";

DROP TABLE "public"."Rooms";

DROP TABLE "public"."Schedules";

DROP TABLE "public"."UserReserves";

DROP TABLE "public"."Users";
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201005020456-create-periods..20201007034508-tables-renamed-to-singular
--- datamodel.dml
+++ datamodel.dml
@@ -3,93 +3,93 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
-model Users {
+model User {
   id         Int    @default(autoincrement()) @id
   enrollment String @unique
   name       String
   email      String @unique
-  UserReserve UserReserves[]
+  UserReserve UserReserve[]
-  user1 Friends[] @relation("user1")
-  user2 Friends[] @relation("user2")
+  user1 Friend[] @relation("user1")
+  user2 Friend[] @relation("user2")
-  user      Invites[] @relation("user")
-  recipient Invites[] @relation("recipient")
+  user      Invite[] @relation("user")
+  recipient Invite[] @relation("recipient")
 }
-model Friends {
+model Friend {
   id Int @default(autoincrement()) @id
-  user1 Users @relation("user1", fields: [userId1], references: [id])
-  user2 Users @relation("user2", fields: [userId2], references: [id])
+  user1 User @relation("user1", fields: [userId1], references: [id])
+  user2 User @relation("user2", fields: [userId2], references: [id])
   userId1 Int
   userId2 Int
 }
-model Invites {
+model Invite {
   id Int @default(autoincrement()) @id
-  user      Users @relation("user", fields: [userId], references: [id])
-  recipient Users @relation("recipient", fields: [recipientId], references: [id])
+  user      User @relation("user", fields: [userId], references: [id])
+  recipient User @relation("recipient", fields: [recipientId], references: [id])
   userId      Int
   recipientId Int
 }
-model Reserves {
+model Reserve {
   id    Int @default(autoincrement()) @id
   day   Int
   month Int
   year  Int
-  room   Rooms @relation(fields: [roomId], references: [id])
+  room   Room @relation(fields: [roomId], references: [id])
   roomId Int
-  schedule    Schedules      @relation(fields: [scheduleId], references: [id])
+  schedule    Schedule      @relation(fields: [scheduleId], references: [id])
   scheduleId  Int
-  UserReserve UserReserves[]
+  UserReserve UserReserve[]
 }
-model UserReserves {
+model UserReserve {
   id Int @default(autoincrement()) @id
-  user   Users @relation(fields: [userId], references: [id])
+  user   User @relation(fields: [userId], references: [id])
   userId Int
-  reserve   Reserves @relation(fields: [reserveId], references: [id])
+  reserve   Reserve @relation(fields: [reserveId], references: [id])
   reserveId Int
 }
-model Rooms {
-  id        Int        @default(autoincrement()) @id
-  initials  String     @unique
-  available Boolean    @default(true)
-  Reserve   Reserves[]
+model Room {
+  id        Int       @default(autoincrement()) @id
+  initials  String    @unique
+  available Boolean   @default(true)
+  Reserve   Reserve[]
 }
-model Schedules {
+model Schedule {
   id          Int    @default(autoincrement()) @id
   initialHour String
   endHour     String
-  period   Periods @relation(fields: [periodId], references: [id])
+  period   Period @relation(fields: [periodId], references: [id])
   periodId Int
-  Reserve Reserves[]
+  Reserve Reserve[]
 }
-model Periods {
+model Period {
   id Int @default(autoincrement()) @id
   name        String
   initialHour String
   endHour     String
-  Schedules Schedules[]
+  Schedule Schedule[]
 }
```


