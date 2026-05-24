import sys
from bs4 import BeautifulSoup

lyric_original = []
lyric_translated = []

def parse_lyrics_from_html(html_content, output = True):
    """从 HTML 字符串中解析 Lyrics-line 并输出原文和译文"""
    soup = BeautifulSoup(html_content, 'html.parser')

    # 查找所有 class 包含 "Lyrics-line" 的 div
    lyric_lines = soup.find_all('div', class_=lambda c: c and 'Lyrics-line' in c)

    if not lyric_lines:
        print("未找到任何包含 'Lyrics-line' 的 div 元素。")
        print("请确保复制的 HTML 片段包含正确的 class 属性。")
        return

    print(f"共找到 {len(lyric_lines)} 行歌词内容：\n")

    for idx, line_div in enumerate(lyric_lines, 1):
        original_div = line_div.find('div', class_='Lyrics-original')
        translated_div = line_div.find('div', class_='Lyrics-translated')

        original_text = original_div.get_text(strip=True) if original_div else "[无原文]"
        translated_text = translated_div.get_text(strip=True) if translated_div else "[无译文]"

        print(f"第 {idx} 行:")
        print(f"  原文: {original_text}")
        print(f"  译文: {translated_text}")
        print("-" * 50)

        if original_text:
            lyric_original.append(original_text)
        lyric_original.append('\n')
        if translated_text:
            lyric_translated.append(translated_text)
        lyric_translated.append('\n')

    if output:
        f = open('lyrics.txt', 'w', encoding='utf-8')
        f.writelines(lyric_original)
        f.write('\n' + '-' * 50 + '\n')
        f.writelines(lyric_translated)


def main(output = True):
    print("=== 本地 HTML 歌词解析工具 ===")
    print("请粘贴从浏览器复制的 HTML 片段（包含 Lyrics-line 的 div），")
    print("粘贴完成后按 Enter，然后按 Ctrl+D (Linux/Mac) 或 Ctrl+Z (Windows) 结束输入。\n")

    # 读取所有输入内容（直到 EOF）
    try:
        html_content = input('>>')
    except KeyboardInterrupt:
        print("\n输入已取消。")
        return

    if not html_content.strip():
        print("错误：未接收到任何内容。")
        return

    parse_lyrics_from_html(html_content, output)

    return [lyric_original, lyric_translated]


if __name__ == "__main__":
    main()