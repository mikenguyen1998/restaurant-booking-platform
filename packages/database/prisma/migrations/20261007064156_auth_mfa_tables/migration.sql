-- CreateTable
CREATE TABLE "MfaAuthenticator" (
    "userId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "pendingSecret" TEXT,
    "lastUsedStep" INTEGER,

    CONSTRAINT "MfaAuthenticator_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "MfaRecoveryCode" (
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,

    CONSTRAINT "MfaRecoveryCode_pkey" PRIMARY KEY ("userId","codeHash")
);

-- CreateTable
CREATE TABLE "MfaFailure" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "failedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MfaFailure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MfaFailure_userId_failedAt_idx" ON "MfaFailure"("userId", "failedAt");

-- CreateIndex
CREATE INDEX "MfaFailure_failedAt_idx" ON "MfaFailure"("failedAt");
