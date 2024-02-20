import os
import json

def process_ipynb_file(file_path, output_dir):
    with open(file_path, 'r', encoding='utf-8') as file:
        notebook = json.load(file)

    python_content = "def main():\n"

    for cell in notebook['cells']:
        if cell['cell_type'] == 'code':
            for line in cell['source']:
                if not line.startswith('!'):
                    python_content += "  " + line
            python_content += "\n\n"

    new_file_name = 'genai_' + os.path.basename(file_path).replace('.ipynb', '.py')
    new_file_path = os.path.join(output_dir, new_file_name)

    with open(new_file_path, 'w', encoding='utf-8') as new_file:
        new_file.write(python_content)

def main():
    output_dir = 'src/genai_workshop/'
    os.makedirs(output_dir, exist_ok=True)

    for file in os.listdir('.'):
        if file.endswith('.ipynb'):
            process_ipynb_file(file, output_dir)

if __name__ == '__main__':
    main()