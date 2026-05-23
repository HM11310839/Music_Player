import os
import get_lyric

def getinfo(name):
    return f'#-- Lyric For {name}.mp4 --#\n'

def write_lyrics(lyric_original, lyric_translated, name):
    base_path = 'D:\\Music\\「Hello」初音ミク特别演唱会（20260214夜公演）'
    path_original = os.path.join(base_path, 'foreign', name + '.txt')
    path_translated = os.path.join(base_path, 'chinese', name + '.txt')
    print(path_original, path_translated)
    f = open(path_original, 'w', encoding='utf-8')
    f.write(getinfo(name))
    f.writelines(lyric_original)
    f.close()
    f = open(path_translated, 'w', encoding='utf-8')
    f.write(getinfo(name))
    f.writelines(lyric_translated)
    f.close()

def main():
    name = input('Enter song name:\n>>')
    result = get_lyric.main()
    if result:
        write_lyrics(result[0], result[1], name)
    else:
        print("错误：未接收到任何内容。")
        return

if __name__ == '__main__':
    main()