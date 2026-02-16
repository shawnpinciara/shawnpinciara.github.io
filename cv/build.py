import markdown
import re

def md_to_html(md_file, html_file):
    with open(md_file, 'r') as f:
        content = f.read()

    # Split by lines starting with #
    sections = re.split(r'(?=^#)', content, flags=re.MULTILINE)

    html_sections = []
    for section in sections:
        if not section.strip():
            continue
        lines = section.strip().split('\n')
        title = lines[0].lstrip('#').strip()
        body = '\n'.join(lines[1:]).strip()
        if body:
            body_html = markdown.markdown(body)
        else:
            body_html = ''
        html_sections.append(f'<h2 class="h2_title pl-4">{title}</h2>\n<div class="pl-10">\n{body_html}\n</div>\n')

    professional_profile_html = '\n'.join(html_sections)

    # Now, replace the section in index.html
    with open(html_file, 'r') as f:
        html_content = f.read()

    # Find the start and end
    start_pattern = r'(<h1 class="h1_title" id="professional-profile">Professional profile:</h1>)'
    end_pattern = r'(<h1 class="h1_title">To sum up:</h1>)'

    start_match = re.search(start_pattern, html_content)
    end_match = re.search(end_pattern, html_content)

    if start_match and end_match:
        before = html_content[:start_match.end()]
        after = html_content[end_match.start():]
        new_html = before + '\n\n' + professional_profile_html + '\n\n' + after
        with open(html_file, 'w') as f:
            f.write(new_html)
        print("Updated index.html")
    else:
        print("Could not find the section to replace")

if __name__ == "__main__":
    md_to_html('works.md', 'index.html')