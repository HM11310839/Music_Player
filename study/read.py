import sys
from bs4 import BeautifulSoup

path = "deco27-niconico.html"
def parse_lyrics_from_html(html_content, output = True):
    """从 HTML 字符串中解析 videos 并输出原文和译文"""
    soup = BeautifulSoup(html_content, 'html.parser')

    class_line = 'NC-MediaObject NC-VideoMediaObject VideoContainer-item NC-VideoMediaObject_thumbnailWidth192 NC-MediaObject_withAction'
    video_lines = soup.find_all('div', class_=class_line)

    if not video_lines:
        print("未找到任何包含 'videos' 的 div 元素。")
        print("请确保复制的 HTML 片段包含正确的 class 属性。")
        return

    print(f"共找到 {len(video_lines)} 行歌词内容：\n")

    for idx, video_div in enumerate(video_lines, 1):
        class_body = 'NC-MediaObject-body'
        body = video_div.find('div', class_=class_body)

        class_title = 'NC-MediaObjectTitle NC-VideoMediaObject-title NC-MediaObjectTitle_fixed2Line'
        title = body.find('h2', class_=class_title).get_text(strip=True).replace('\n', '')

        class_time = 'NC-VideoRegisteredAtText-text'
        time = body.find('span', class_=class_time).get_text(strip=True).replace('\n', '')

        class_description = 'NC-VideoMediaObject-description'
        description_text = body.find('div', class_=class_description).get_text(strip=True).replace('\n', '')
        description = ''
        if '「' in description_text and '」' in description_text:
            l = description_text.find('「')
            r = description_text.find('」')
            description = description_text[l:r+1]

        print(f"第 {idx} 行:")
        print(f"{title}({time})   {description}")
        print("-" * 50)



def main(output = True):
    print("=== 本地 HTML 歌词解析工具 ===")
    print(f"PATH: {path}")

    f = open(path, 'r', encoding='utf-8')
    html_content = f.read()
    print(html_content)

    parse_lyrics_from_html(html_content, output)


if __name__ == "__main__":
    main()