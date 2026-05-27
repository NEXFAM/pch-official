#!/usr/bin/env python3
"""Generate fake winner notifications in the PCH Official SQLite database."""

import sqlite3
import random
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'pch_official.db')

FIRST_NAMES = [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
    'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy',
    'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
    'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle',
    'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Edward', 'Melissa',
    'Ronald', 'Deborah',
]
LAST_INITIALS = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')


def rand_amount():
    raw = random.randint(10000, 80000)
    return round(raw / 500) * 500


def rand_date():
    days_ago = random.randint(1, 60)
    dt = datetime.now() - timedelta(days=days_ago)
    dt = dt.replace(
        hour=random.randint(0, 23),
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
        microsecond=0,
    )
    return dt.strftime('%Y-%m-%d %H:%M:%S')


def main():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        print("Start the dev server first to create the database, then run this script.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    count = random.randint(10, 15)
    print(f"Inserting {count} winner notifications…\n")

    for _ in range(count):
        first = random.choice(FIRST_NAMES)
        last_init = random.choice(LAST_INITIALS)
        name = f"{first} {last_init}."
        amount = rand_amount()
        won_at = rand_date()

        cur.execute(
            'INSERT INTO winner_notifications (winner_name, amount, won_at) VALUES (?, ?, ?)',
            (name, amount, won_at),
        )
        print(f"  ✅  {name:<20} ${amount:>8,}   ({won_at})")

    conn.commit()
    conn.close()
    print(f"\nDone — {count} notifications inserted.")


if __name__ == '__main__':
    main()
