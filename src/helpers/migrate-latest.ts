import * as path from "path";
import { promises as fs } from "fs";
import { Kysely, Migrator, FileMigrationProvider } from "kysely";
import { DB } from "kysely-codegen";
import * as dotenv from "dotenv";
import { kyselyDialect } from "../providers/kysely-dialect";
import { Paths } from "./paths";

dotenv.config();

console.log(
  `Starting DB migration script.\nProject root dir: ${Paths.projectRoot}\nMigrations dir: ${Paths.migrationsDir}`,
);

async function migrateToLatest() {
  const db = new Kysely<DB>({
    dialect: kyselyDialect,
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: Paths.migrationsDir,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`✔️ ️migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`❌ failed to execute migration "${it.migrationName}"`);
    }
  });

  if (results?.length === 0 && !error) {
    console.log("✔️ no migrations were executed");
  }

  if (results?.length === 0 && error) {
    console.log("❌ no migrations were executed");
  }

  if (error) {
    console.error("❌ failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
