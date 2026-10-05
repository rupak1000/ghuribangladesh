-- Email-only sign-in (ADR-0005): the recovery code is no longer used.
ALTER TABLE "Account" DROP COLUMN "recoveryHash";
