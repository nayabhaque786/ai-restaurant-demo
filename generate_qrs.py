import qrcode
import os

# If testing locally, use localhost:3000. When deployed online (e.g., Vercel), replace with your public domain!
BASE_URL = "http://localhost:3000/r/empire-restaurant/t"

# Create a folder to store the generated QR codes
output_dir = "qr_codes"
os.makedirs(output_dir, exist_ok=True)

# Generate QR codes for Tables 1 to 5
for table_num in range(1, 6):
    target_url = f"{BASE_URL}/{table_num}"
    
    # Create QR image
    qr_img = qrcode.make(target_url)
    
    # Save image file
    file_path = os.path.join(output_dir, f"table_{table_num}.png")
    qr_img.save(file_path)
    print(f"✅ Generated QR for Table {table_num} -> Saved at {file_path}")

print("\n🎉 All table QR codes generated successfully inside the 'qr_codes' folder!")