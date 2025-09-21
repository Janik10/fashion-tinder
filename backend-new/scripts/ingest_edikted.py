import csv
import mysql.connector

# Connect to the MySQL database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Jmoney1231$#2!",
    database="fashion_tinder"
)
cursor = conn.cursor()

brand_id = 2  # Edikted
category_id = 1  # Activewear or default

with open("data/edikted_products.csv", newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        cursor.execute("SELECT id FROM fashion_items WHERE product_id = %s", (row["product_id"],))
        if cursor.fetchone():
            print(f"Skipping existing product: {row['product_id']}")
            continue

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
            row["current_price"].replace("$", "").strip(),
            "USD",
            row["image_url"],
            row["colors"].split("/")[0].strip() if row["colors"] else "Unknown",
            1,
            brand_id,
            category_id
        ))
        print(f"Inserted product: {row['product_id']}")

conn.commit()
cursor.close()
conn.close()
print("✅ Edikted CSV ingestion complete.")
