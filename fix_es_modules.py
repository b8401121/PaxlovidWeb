import re

def fix():
    # 1. Update index.html
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    html = html.replace('<script type="module" src="main.js"></script>',
                        '<script src="data.js"></script>\n  <script src="parser.js"></script>\n  <script src="main.js"></script>')
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    # 2. Update data.js
    with open('data.js', 'r', encoding='utf-8') as f:
        data = f.read()
    
    data = data.replace('export const ', 'const ')
    
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(data)
        
    # 3. Update parser.js
    with open('parser.js', 'r', encoding='utf-8') as f:
        parser = f.read()
        
    parser = re.sub(r'import \{.*?\} from ["\'].*?["\'];\s*', '', parser)
    parser = parser.replace('export function ', 'function ')
    parser = parser.replace('export interface ', 'interface ')
    
    with open('parser.js', 'w', encoding='utf-8') as f:
        f.write(parser)
        
    # 4. Update main.js
    with open('main.js', 'r', encoding='utf-8') as f:
        main = f.read()
        
    main = re.sub(r'import \{.*?\} from ["\'].*?["\'];\s*', '', main)
    
    with open('main.js', 'w', encoding='utf-8') as f:
        f.write(main)

if __name__ == '__main__':
    fix()
    print("Fixed!")
