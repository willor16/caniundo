# Databases

Generated from `entries/` in https://github.com/willor16/caniundo. Do not edit by hand.

- `mongosh --eval "db.dropDatabase()"`: NO
- `mysql -e "DROP TABLE users" shop`: NO
- `mysql -e "DELETE FROM users" shop`: NO
- `psql -c "DELETE FROM users"`: NO
- `psql -c "ALTER TABLE users DROP COLUMN email"`: NO
- `psql -c "DROP DATABASE shop"`: NO
- `psql -c "DROP SCHEMA public CASCADE"`: NO
- `psql -c "DROP TABLE users"`: NO
- `psql -c "TRUNCATE users"`: NO
- `psql -c "UPDATE users SET active = false"`: NO
- `redis-cli FLUSHALL`: PARTLY
- `sqlite3 app.db "DELETE FROM users"`: NO
- `sqlite3 app.db "DROP TABLE users"`: NO
- `sqlite3 app.db "UPDATE users SET active = 0"`: NO

## mongosh --eval "db.dropDatabase()"

**NO** · Delete a database in MongoDB · id `mongo-drop`

- **Matches:** `mongosh`, with an argument like `*.dropdatabase(*`; or `mongo`, with an argument like `*.dropdatabase(*`
- **Lost:** The database and its files.
- **Before:** Make a copy with mongodump, and check that it restores.
- **Evidence:** Documented, not tested
- **Source:** https://www.mongodb.com/docs/manual/reference/method/db.dropdatabase/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/mongo-drop/ (Spanish: https://willor16.github.io/caniundo/es/c/mongo-drop/)

## mysql -e "DROP TABLE users" shop

**NO** · Delete or empty a table in MySQL · id `mysql-drop`

- **Matches:** SQL `DROP TABLE` in mysql; or SQL `TRUNCATE` in mysql; or SQL `DROP DATABASE` in mysql; or SQL `DROP SCHEMA` in mysql; or SQL `ALTER TABLE … DROP` in mysql
- **Lost:** The data. MySQL commits these statements on its own, so ROLLBACK does nothing, even inside a transaction.
- **Before:** Rename the table instead of deleting it, or copy it with mysqldump.
- **Evidence:** Documented, not tested
- **Source:** https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html (checked 2026-11-25)
- **Source:** https://dev.mysql.com/doc/refman/8.4/en/cannot-roll-back.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/mysql-drop/ (Spanish: https://willor16.github.io/caniundo/es/c/mysql-drop/)

## mysql -e "DELETE FROM users" shop

**NO** · Delete or change every row in MySQL · id `mysql-every-row`

- **Matches:** SQL `DELETE FROM` in mysql, with no WHERE (or one that is always true); or SQL `UPDATE … SET` in mysql, with no WHERE (or one that is always true)
- **Lost:** Every row, or its old values, because there is no WHERE. MySQL commits each statement unless you open a transaction.
- **Instead:** With InnoDB tables, try it between START TRANSACTION and ROLLBACK.
- **Evidence:** Documented, not tested
- **Source:** https://dev.mysql.com/doc/refman/8.4/en/commit.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/mysql-every-row/ (Spanish: https://willor16.github.io/caniundo/es/c/mysql-every-row/)

## psql -c "DELETE FROM users"

**NO** · Delete every row of a table in PostgreSQL · id `postgres-delete-all`

- **Matches:** SQL `DELETE FROM` in postgres, with no WHERE (or one that is always true)
- **Lost:** Every row, because there is no WHERE.
- **Instead:** Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.

    ```sh
    psql -c "BEGIN; DELETE FROM <table>; ROLLBACK"
    ```
- **Evidence:** Tested: PostgreSQL 17.5 (PGlite), Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/postgres-delete-all/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-delete-all/)

## psql -c "ALTER TABLE users DROP COLUMN email"

**NO** · Delete a column in PostgreSQL · id `postgres-drop-column`

- **Matches:** SQL `ALTER TABLE … DROP COLUMN` in postgres
- **Lost:** The values of that column, in every row. Adding it again leaves it empty.
- **Instead:** Rename it first, and delete it when nothing needs it.

    ```sh
    psql -c "ALTER TABLE <table> RENAME COLUMN <column> TO <old-column>"
    ```

  To go back:

    ```sh
    psql -c "ALTER TABLE <table> RENAME COLUMN <old-column> TO <column>"
    ```
- **Evidence:** Tested: PostgreSQL 17.5 (PGlite), Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/postgres-drop-column/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-drop-column/)

## psql -c "DROP DATABASE shop"

**NO** · Delete a database in PostgreSQL · id `postgres-drop-database`

- **Matches:** SQL `DROP DATABASE` in postgres; or `dropdb`
- **Lost:** The whole database. It cannot run inside a transaction, so there is no ROLLBACK.
- **Before:** Make a copy with pg_dump, and check that it restores.
- **Evidence:** Documented, not tested
- **Source:** https://www.postgresql.org/docs/current/sql-dropdatabase.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/postgres-drop-database/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-drop-database/)

## psql -c "DROP SCHEMA public CASCADE"

**NO** · Delete a schema in PostgreSQL · id `postgres-drop-schema`

- **Matches:** SQL `DROP SCHEMA` in postgres
- **Lost:** With CASCADE, all the tables, views and functions in it.
- **Instead:** Rename it first, and delete it when nothing needs it.

    ```sh
    psql -c "ALTER SCHEMA <schema> RENAME TO <old-schema>"
    ```

  To go back:

    ```sh
    psql -c "ALTER SCHEMA <old-schema> RENAME TO <schema>"
    ```
- **Evidence:** Tested: PostgreSQL 17.5 (PGlite), Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/postgres-drop-schema/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-drop-schema/)

## psql -c "DROP TABLE users"

**NO** · Delete a table in PostgreSQL · id `postgres-drop-table`

- **Matches:** SQL `DROP TABLE` in postgres
- **Lost:** The table and its rows. With CASCADE, also the views and keys that depend on it.
- **Instead:** Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.

    ```sh
    psql -c "BEGIN; DROP TABLE <table>; ROLLBACK"
    ```
- **Evidence:** Tested: PostgreSQL 17.5 (PGlite), Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/postgres-drop-table/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-drop-table/)

## psql -c "TRUNCATE users"

**NO** · Empty a table in PostgreSQL · id `postgres-truncate`

- **Matches:** SQL `TRUNCATE` in postgres
- **Lost:** Every row. With CASCADE, also the rows of the tables that refer to it.
- **Instead:** Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.

    ```sh
    psql -c "BEGIN; TRUNCATE <table>; ROLLBACK"
    ```
- **Evidence:** Tested: PostgreSQL 17.5 (PGlite), Windows, 2026-11-25
- **Source:** https://www.postgresql.org/docs/current/sql-truncate.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/postgres-truncate/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-truncate/)

## psql -c "UPDATE users SET active = false"

**NO** · Change every row of a table in PostgreSQL · id `postgres-update-all`

- **Matches:** SQL `UPDATE … SET` in postgres, with no WHERE (or one that is always true)
- **Lost:** The old values of those columns, in every row, because there is no WHERE.
- **Instead:** Try it in a transaction that ends in ROLLBACK. To keep a copy, use pg_dump --table first.

    ```sh
    psql -c "BEGIN; UPDATE <table> SET <column> = 0; ROLLBACK"
    ```
- **Evidence:** Tested: PostgreSQL 17.5 (PGlite), Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/postgres-update-all/ (Spanish: https://willor16.github.io/caniundo/es/c/postgres-update-all/)

## redis-cli FLUSHALL

**PARTLY** · Delete everything in Redis · id `redis-flush`

- **Matches:** `redis-cli`, with an argument like `flushall`, `flushdb`; or `valkey-cli`, with an argument like `flushall`, `flushdb`
- **Lost:** Every key. It also empties the snapshot on disk (RDB).
- **Kept:** The append-only file, if it was on and has not been rewritten since.
- **To undo:** With the append-only file on: stop the server, delete the FLUSHALL at the end of the file, and start it again.
  - Until: Until Redis rewrites the file, so stop the server right away.
- **Evidence:** Documented, not tested
- **Source:** https://redis.io/docs/latest/commands/flushall/ (checked 2026-11-25)
- **Source:** https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/ (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/redis-flush/ (Spanish: https://willor16.github.io/caniundo/es/c/redis-flush/)

## sqlite3 app.db "DELETE FROM users"

**NO** · Delete every row of a table in SQLite · id `sqlite-delete-all`

- **Matches:** SQL `DELETE FROM` in sqlite, with no WHERE (or one that is always true)
- **Lost:** Every row of the table.
- **Before:** Close the programs that use the database and copy the file.

    ```sh
    cp <database> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <database>
    ```
- **Evidence:** Tested: SQLite 3.50.4, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/sqlite-delete-all/ (Spanish: https://willor16.github.io/caniundo/es/c/sqlite-delete-all/)

## sqlite3 app.db "DROP TABLE users"

**NO** · Delete a table in SQLite · id `sqlite-drop-table`

- **Matches:** SQL `DROP TABLE` in sqlite
- **Lost:** The table, with its rows, indexes and triggers.
- **Before:** Close the programs that use the database and copy the file.

    ```sh
    cp <database> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <database>
    ```
- **Evidence:** Tested: SQLite 3.50.4, Windows, 2026-11-25
- **Source:** https://sqlite.org/lang_droptable.html (checked 2026-11-25)
- **Page:** https://willor16.github.io/caniundo/c/sqlite-drop-table/ (Spanish: https://willor16.github.io/caniundo/es/c/sqlite-drop-table/)

## sqlite3 app.db "UPDATE users SET active = 0"

**NO** · Change every row of a table in SQLite · id `sqlite-update-all`

- **Matches:** SQL `UPDATE … SET` in sqlite, with no WHERE (or one that is always true)
- **Lost:** The old values of those columns, in every row.
- **Before:** Close the programs that use the database and copy the file.

    ```sh
    cp <database> <copy>
    ```

  To go back:

    ```sh
    cp <copy> <database>
    ```
- **Evidence:** Tested: SQLite 3.50.4, Windows, 2026-11-25
- **Page:** https://willor16.github.io/caniundo/c/sqlite-update-all/ (Spanish: https://willor16.github.io/caniundo/es/c/sqlite-update-all/)
