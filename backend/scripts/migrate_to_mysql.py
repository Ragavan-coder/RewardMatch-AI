import sqlite3
import pymysql
import os

sqlite_path = os.path.join(os.path.dirname(__file__), "..", "rewardmatch.db")
sqlite_path = os.path.abspath(sqlite_path)

if os.path.exists(sqlite_path):
    sconn = sqlite3.connect(sqlite_path)
    sconn.row_factory = sqlite3.Row
    scur = sconn.cursor()

    mconn = pymysql.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="1234567890",
        database="rewardmatch",
        charset="utf8mb4",
    )
    mcur = mconn.cursor()

    # Tables to migrate in dependency order
    tables = ["users", "credit_cards", "bank_accounts", "rewards", "transactions"]

    for table in tables:
        try:
            rows = scur.execute(f"SELECT * FROM {table}").fetchall()
            if rows:
                cols = list(rows[0].keys())
                col_names = ", ".join([f"`{c}`" for c in cols])
                placeholders = ", ".join(["%s"] * len(cols))
                sql = f"INSERT IGNORE INTO `{table}` ({col_names}) VALUES ({placeholders})"
                for r in rows:
                    val_tuple = tuple(r[c] for c in cols)
                    mcur.execute(sql, val_tuple)
                mconn.commit()
                print(f"Migrated {len(rows)} records into MySQL table: {table}")
        except Exception as e:
            print(f"Table {table} migration note:", e)

    sconn.close()
    mconn.close()
    print("Migration from SQLite to MySQL completed successfully!")
else:
    print("No existing SQLite database file found to migrate.")
