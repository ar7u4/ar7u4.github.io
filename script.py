import re
import json

def extract_log_data(log_line):
    pattern = re.compile(r"status=(?P<status>[^;]+).*?CN=(?P<CN>[^;]+);expiry=(?P<expiry>[^;]+);remaining_days=(?P<remaining_days>\d+);email='(?P<email>[^']+)';ci=(?P<ci>[^\s]+)")
    match = pattern.search(log_line)

    if match:
        return match.groupdict()
    return None

def process_log_file(input_file, output_file):
    data_list = []
    try:
        with open(input_file, "r") as file:
            for line in file:
                extracted_data = extract_log_data(line)
                if extracted_data:
                    extracted_data["days"] = int(extracted_data["remaining_days"])
                    extracted_data["badge"] = f"https://img.shields.io/badge/{extracted_data['status']}-{'red' if extracted_data['status']=='EXPIRED' else 'orange' if extracted_data['status']=='CRITICAL' else 'brightgreen'}"
                    data_list.append(extracted_data)

        with open(output_file, "w") as json_file:
            json.dump(data_list, json_file, indent=4)

        print(f"JSON file '{output_file}' created successfully.")

    except FileNotFoundError:
        print(f"Error: {input_file} not found.")

# Run the function
process_log_file("expiry.log", "data.json")
