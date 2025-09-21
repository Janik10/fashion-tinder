import csv
import mysql.connector
import re

# Connect to the MySQL database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Jmoney1231$#2!",
    database="fashion_tinder"
)
cursor = conn.cursor()

# Brand and category config (you can make this dynamic later)
brand_id = 1  # Gymshark
category_id = 1  # Default

with open("data/gymshark_products.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        # Skip if product already exists
        cursor.execute("SELECT id FROM fashion_items WHERE product_id = %s", (row["product_id"],))
        if cursor.fetchone():
            print(f"Skipping existing product: {row['product_id']}")
            continue

        # Extract numeric price safely
        price_match = re.search(r"\d+(\.\d+)?", row["price"])
        price_value = float(price_match.group()) if price_match else 0.0

        # Insert item
        cursor.execute("""
            INSERT INTO fashion_items (
                product_id,
                name,
                price,
                currency,
                image_url,
                color_primary,
                is_active,
                brand_id,
                category_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            row["product_id"],
            row["name"],
            price_value,
            "USD",
            row["image_url"],
            row["color"].split("/")[0],  # Use primary color only
            1,  # is_active
            brand_id,
            category_id
        ))
        print(f"Inserted product: {row['product_id']}")

conn.commit()
cursor.close()
conn.close()
print("✅ Gymshark CSV ingestion complete.")
