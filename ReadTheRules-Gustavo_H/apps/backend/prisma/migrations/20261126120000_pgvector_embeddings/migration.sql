-- Busca semântica: vetores de verdade (pgvector) ligados à campanha, com o trecho de texto indexado.
CREATE EXTENSION IF NOT EXISTS vector;

-- A coluna antiga era texto e nunca foi usada; os vetores são recriados sob demanda.
DELETE FROM "Embedding";
ALTER TABLE "Embedding" DROP COLUMN "vector";
ALTER TABLE "Embedding" ADD COLUMN "vector" vector NOT NULL;
ALTER TABLE "Embedding" ADD COLUMN "id_campanha" UUID NOT NULL;
ALTER TABLE "Embedding" ADD COLUMN "trecho" TEXT NOT NULL;

CREATE INDEX "Embedding_id_campanha_idx" ON "Embedding"("id_campanha");
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_id_campanha_fkey" FOREIGN KEY ("id_campanha") REFERENCES "Campanha"("id_campanha") ON DELETE CASCADE ON UPDATE NO ACTION;
