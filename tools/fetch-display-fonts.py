from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
import re

root = Path(__file__).resolve().parent.parent
folder = root / 'assets/fonts'
folder.mkdir(exist_ok=True)
agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
def fetch(url):
    with urlopen(Request(url, headers={'User-Agent': agent}), timeout=25) as response:
        return response.read()

source = (root / 'assets/home.js').read_text(encoding='utf-8')
headings = source.split('const chineseHtml = {', 1)[1].split('};', 1)[0]
characters = ''.join(sorted(set(re.findall(r'[^\x00-\x7f]', headings))))
fonts = [
    ('Barlow+Condensed:wght@800', 'procession-display.woff2', 'barlowcondensed', None),
    ('Noto+Serif+TC:wght@900', 'procession-chinese.woff2', 'notoseriftc', characters)
]
for family, name, project, text in fonts:
    css_url = 'https://fonts.googleapis.com/css2?family=' + family + '&display=swap'
    if text:
        css_url += '&text=' + quote(text)
    css = fetch(css_url).decode()
    urls = re.findall(r'url\((https://[^)]+)\)', css)
    if not urls:
        raise RuntimeError('No font supplied by Google Fonts')
    data = fetch(urls[-1])
    if data[:4] != b'wOF2':
        from fontTools.ttLib import TTFont
        from io import BytesIO
        font = TTFont(BytesIO(data))
        font.flavor = 'woff2'
        packed = BytesIO()
        font.save(packed)
        data = packed.getvalue()
    (folder / name).write_bytes(data)
    license_url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/' + project + '/OFL.txt'
    license_text = fetch(license_url).decode('utf-8')
    (folder / (project + '-OFL.txt')).write_text('\n'.join(line.rstrip() for line in license_text.splitlines()) + '\n', encoding='utf-8')
    print(name, len(data), 'bytes; SIL Open Font License saved')
