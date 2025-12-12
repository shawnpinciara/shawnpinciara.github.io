import os
import markdown
from pathlib import Path

# Define the path to the markdown file and the output HTML file
md_file_path = Path('mdToHtml').glob('*.md')
md_file = next(md_file_path, None)

if md_file:
    # Read the markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Convert markdown to HTML
    html_content = markdown.markdown(md_content)

    # Create the final HTML layout
    final_html = f'''<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <link href="../style.css" rel="stylesheet">\n    <title>{{{{ title }}}}</title>\n</head>\n<body>\n    <div class="container">\n        <h1>{{{{ title }}}}</h1>\n        {html_content}\n    </div>\n</body>\n</html>'''

    # Write the output HTML file
    output_file_path = md_file.with_suffix('.html')
    with open(output_file_path, 'w', encoding='utf-8') as f:
        f.write(final_html)
    print(f'Converted {md_file.name} to {output_file_path.name}')
else:
    print('No markdown file found in the directory.')