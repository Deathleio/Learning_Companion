import zipfile
import os

def extract_small_subset(zip_path, output_csv_path, row_limit=5000):
    """Streams a massive compressed ZIP file and extracts a tiny row subset without full extraction."""
    if not os.path.exists(zip_path):
        print(f"Error: Could not find the zip file at {zip_path}")
        return

    print("Opening compressed dataset stream...")
    with zipfile.ZipFile(zip_path, 'r') as archive:
        # Find the main CSV file inside the zip archive
        csv_filename = [name for name in archive.namelist() if name.endswith('.csv')][0]
        
        print(f"Streaming text data from: {csv_filename}")
        with archive.open(csv_filename, 'r') as compressed_file:
            with open(output_csv_path, 'w', encoding='utf-8') as output_file:
                for current_row_index in range(row_limit):
                    line = compressed_file.readline()
                    if not line:
                        break  # Break early if the end of file is reached
                    
                    # Decode the binary string to standard text format
                    decoded_line = line.decode('utf-8')
                    output_file.write(decoded_line)
                    
                    if current_row_index % 1000 == 0 and current_row_index > 0:
                        print(f"Ingested and saved {current_row_index} rows...")

    print(f"Pipeline complete! Shortened dataset saved to: {output_csv_path}")

if __name__ == "__main__":
    # Define exact path parameters inside your workspace structure
    target_zip = "KT1.zip"
    destination_csv = "ednet_small_sample.csv"
    
    # Extracting 5,000 rows is more than enough for testing metrics
    extract_small_subset(target_zip, destination_csv, row_limit=5000)