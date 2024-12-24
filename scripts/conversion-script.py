import gzip
import re
import json
import csv
import sys

def main():
    if len(sys.argv) != 2:
        print("Usage: python modified_script.py <input_file>")
        sys.exit(1)

    file_name = sys.argv[1]

    try:
        # Extract and rename the .gz file
        new_file_name = extract_and_rename(file_name)

        # Format the JSON file
        overwrite_json(new_file_name)

        # Convert the JSON file to a CSV file
        convert_json_to_csv(new_file_name)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

def extract_and_rename(file_name):
    """Extract a .gz file and rename it to ensure it has a .json extension."""
    try:
        # Read the content of the .gz file
        with gzip.open(file_name, "rb") as gz_file:
            content = gz_file.read()

        # Generate a new file name by removing digits and .gz extension
        pattern = r"\d*\.gz"
        new_file_name = re.sub(pattern, "", file_name)

        # Ensure the new file name ends with .json
        new_file_name = new_file_name.rstrip('.')
        if not new_file_name.endswith(".json"):
            new_file_name += ".json"

        # Write the content to the new file
        with open(new_file_name, "wb") as new_file:
            new_file.write(content)

        print(f"Extracted {file_name} and renamed it to {new_file_name}")
        return new_file_name
    except Exception as e:
        raise RuntimeError(f"Failed to extract and rename file: {e}")

def overwrite_json(file_name):
    """Format the JSON file to ensure it has valid syntax."""
    try:
        with open(file_name, 'r') as f:
            lines = f.read().splitlines()

        # Remove empty lines and wrap with square brackets
        data = list(filter(lambda x: x.strip(), lines))
        formatted_data = '[{}]'.format(','.join(data))

        # Validate the JSON structure
        json.loads(formatted_data)

        # Overwrite the file with the formatted data
        with open(file_name, 'w') as f:
            f.write(formatted_data)

        print(f"Formatted and overwritten {file_name} with valid JSON.")
    except Exception as e:
        raise RuntimeError(f"Failed to format JSON file: {e}")

def convert_json_to_csv(file_name):
    """Convert a JSON file to a CSV file, keeping specified columns."""
    try:
        # Define columns to keep
        columns_to_keep = ['session', 'eventid', 'src_ip', 'destfile', 'username', 'password', 'timestamp', 'input']

        # Read the JSON data
        with open(file_name, 'r') as f:
            data = json.load(f)

        # Ensure the CSV file name has only one .csv extension
        csv_file_name = file_name.replace('.json', '').rstrip('.')
        if not csv_file_name.endswith('.csv'):
            csv_file_name += '.csv'

        # Write to CSV
        with open(csv_file_name, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(columns_to_keep)  # Write header row

            for item in data:
                row = [item.get(col, '') for col in columns_to_keep]
                writer.writerow(row)

        print(f"Converted {file_name} to {csv_file_name}, keeping only specified columns.")
    except Exception as e:
        raise RuntimeError(f"Failed to convert JSON to CSV: {e}")

if __name__ == "__main__":
    main()
