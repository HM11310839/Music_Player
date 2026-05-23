from pathlib import Path

def convert_txt_to_lyric(directory="."):
    """
    遍历目录下所有 .txt 文件，复制其内容到同名的 .lyric 文件中。

    Args:
        directory: 要搜索的根目录，默认为当前目录。
    """
    base = Path(directory)
    for txt_file in base.rglob("*.EXE"):          # 递归查找所有 .txt 文件
        lyric_file = txt_file.with_suffix(".lyric")   # 替换扩展名为 .lyric
        lyric_file.write_bytes(txt_file.read_bytes()) # 二进制复制内容
        print(f"已复制：{txt_file} -> {lyric_file}")

if __name__ == "__main__":
    convert_txt_to_lyric('D:/Music/「Hello」初音ミク特别演唱会（20260214夜公演）')  # 处理当前目录
    #convert_txt_to_lyric('D:/Music/Music_Player/lyrics')