# 上传前的文档转换与 PDF 压缩

## 可直接复用的 Prompt

上传附件前，先检查文件类型和实际字节数。遇到 DOCX，使用本机 Microsoft Word 将它导出为 PDF；不要直接上传 DOCX，也不要只改扩展名。遇到大于 10 MiB（10 × 1024 × 1024，即 10,485,760 字节）的 PDF，包括 DOCX 转换得到的 PDF，使用当前默认 Python `D:\MiniConda\python.exe` 中已安装的 PyMuPDF 1.28.2 压缩。

保留源文件，转换和压缩均生成独立副本。先无损整理 PDF 对象和压缩数据流；仍超限时，再逐档降低内嵌图片的分辨率和 JPEG 质量。不要将整页转成图片，不要删除正文、图片、附件或页面来凑大小。保持原有彩色内容、可搜索文字、链接、书签和已有结构标签；原稿缺少这些功能时不要声称转换已自动补齐。

压缩完成后核对页数、文字和链接，并将最终 PDF 逐页渲染检查，确认没有乱码、缺页、裁切，图表细节和小字清晰可读。只有最终文件不大于 10,485,760 字节且通过检查后才可上传。若最小候选仍超限，保留候选并说明大小，暂不上传该文件，不要无限降低画质。

按照原任务的目录和命名规则上传最终 PDF，并将 Markdown 中的附件链接替换为服务器实际返回的 PDF CDN 地址，链接文字标明 PDF。报告原文件、最终文件、转换前后大小和上传结果。认证、冲突检查和上传验证继续遵循 [上传操作说明](uploadscript/PROMPT.md)。

## 环境与依赖

以下命令在仓库根目录的 PowerShell 中执行，继续遵循 RTK 规则，不需要构建 Nuxt 或启动开发服务。

```powershell
rtk proxy D:\MiniConda\python.exe -c "import sys, pymupdf; print(sys.executable); print(pymupdf.VersionBind)"
```

PDF 压缩只需要已经安装的 PyMuPDF。DOCX 转换还需要本机 Microsoft Word 和同一 Python 环境中的 `pywin32`。仅在缺少 `win32com` 时安装：

```powershell
rtk proxy D:\MiniConda\python.exe -c "import win32com.client"
rtk proxy D:\MiniConda\python.exe -m pip install pywin32
```

PyMuPDF 的这套流程只负责处理 PDF；DOCX 的排版由 Word 完成。没有 Word 时，应先使用可用的文档转换工具生成并检查 PDF，再进入压缩步骤，不要将 DOCX 当作 PDF 传入 PyMuPDF。

## 可复用的转换脚本

将下面代码保存为 `.tmp/document-convert/prepare_pdf.py`，或保存到自选脚本目录。脚本接受一个 DOCX 或 PDF 源路径，以及一个尚不存在的 PDF 输出路径；不会覆盖原稿或已有输出。每档压缩都从转换后的原始 PDF 重新读取，避免反复有损编码。

```python
import argparse
import json
from pathlib import Path
import shutil
import tempfile

import pymupdf


LIMIT = 10 * 1024 * 1024
PROFILES = [(225, 200, 85), (180, 150, 80), (145, 120, 75)]


def convert_docx(source, target):
    import pythoncom
    import win32com.client

    pythoncom.CoInitialize()
    word = None
    document = None
    try:
        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0
        word.AutomationSecurity = 3
        document = word.Documents.Open(
            str(source), ReadOnly=True, AddToRecentFiles=False
        )
        document.ExportAsFixedFormat(
            str(target), 17, CreateBookmarks=1, DocStructureTags=True
        )
    finally:
        try:
            if document is not None:
                document.Close(False)
        finally:
            try:
                if word is not None:
                    word.Quit()
            finally:
                pythoncom.CoUninitialize()


def signature(path):
    with pymupdf.open(path) as doc:
        if not doc.is_pdf or doc.needs_pass or not doc.page_count:
            raise ValueError("Expected a nonempty, readable PDF")
        return {
            "pages": doc.page_count,
            "text": ["".join(page.get_text().split()) for page in doc],
            "bookmarks": doc.get_toc(),
            "links": [len(page.get_links()) for page in doc],
            "widgets": [sum(1 for _ in page.widgets()) for page in doc],
            "structure_tree": doc.xref_get_key(
                doc.pdf_catalog(), "StructTreeRoot"
            )[0] != "null",
        }


def prepare(source, output):
    if source.suffix.lower() not in {".docx", ".pdf"}:
        raise ValueError("Input must be DOCX or PDF")
    if not source.is_file():
        raise FileNotFoundError(source)
    if output.suffix.lower() != ".pdf":
        raise ValueError("Output must end in .pdf")
    if output == source or output.exists():
        raise FileExistsError("Choose a new output path; no overwrites")
    output.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="pdf-prepare-") as work:
        work = Path(work)
        pdf = source
        if source.suffix.lower() == ".docx":
            pdf = work / "converted.pdf"
            convert_docx(source, pdf)

        baseline = signature(pdf)
        original_pdf_bytes = pdf.stat().st_size
        best = pdf
        attempts = [{"profile": "original-pdf", "bytes": original_pdf_bytes}]

        if original_pdf_bytes > LIMIT:
            # First pass only rewrites and compresses PDF objects and streams.
            for index, profile in enumerate([None, *PROFILES]):
                candidate = work / f"candidate-{index}.pdf"
                with pymupdf.open(pdf) as doc:
                    if profile is not None:
                        threshold, dpi, quality = profile
                        doc.rewrite_images(
                            dpi_threshold=threshold,
                            dpi_target=dpi,
                            quality=quality,
                            lossy=True,
                            lossless=True,
                            bitonal=False,
                            set_to_gray=False,
                        )
                    doc.save(candidate, garbage=4, deflate=True, use_objstms=1)
                if signature(candidate) != baseline:
                    raise ValueError("PDF content/structure check failed")
                size = candidate.stat().st_size
                attempts.append({"profile": profile or "lossless", "bytes": size})
                if size < best.stat().st_size:
                    best = candidate
                if best.stat().st_size <= LIMIT:
                    break

        shutil.copy2(best, output)

    size = output.stat().st_size
    report = {
        "source": str(source),
        "source_bytes": source.stat().st_size,
        "original_pdf_bytes": original_pdf_bytes,
        "output": str(output),
        "output_bytes": size,
        "pages": baseline["pages"],
        "within_upload_limit": size <= LIMIT,
        "visual_review_required": True,
        "attempts": attempts,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if size <= LIMIT else 2


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare a PDF for iGEM upload")
    parser.add_argument("source", type=lambda x: Path(x).resolve())
    parser.add_argument("output", type=lambda x: Path(x).resolve())
    args = parser.parse_args()
    raise SystemExit(prepare(args.source, args.output))
```

`bitonal=False` 保留原有黑白图像编码；不自动转灰度。三个有损档分别以 200、150、120 dpi 为目标，只有超过相应阈值的图片才会降采样。这些参数是起点，不能代替对小字、曲线、图例及扫描页的目视检查。

### 调用示例

按实际任务修改路径和文件名；这些示例不要求重新上传 Safety 附件。

```powershell
rtk proxy D:\MiniConda\python.exe .tmp/document-convert/prepare_pdf.py "C:\path\Safety protocol.docx" "C:\path\upload\safety-safety-protocol.pdf"
rtk proxy D:\MiniConda\python.exe .tmp/document-convert/prepare_pdf.py "C:\path\large-report.pdf" "C:\path\upload\large-report.pdf"
```

返回码 `0` 表示文件满足大小限制，仍需视觉检查；返回码 `2` 表示保留了最小候选，但仍超限，不可上传。其他错误应先解决，不能把中间文件当作成功结果。

### 渲染与核验

将下面代码保存为 `.tmp/document-convert/render_pdf.py`。它使用同一个 Python 环境渲染每页，不依赖额外的 Poppler 安装。

```python
from pathlib import Path
import sys
import pymupdf

source = Path(sys.argv[1]).resolve()
output = Path(sys.argv[2]).resolve()
output.mkdir(parents=True, exist_ok=True)
with pymupdf.open(source) as doc:
    for number, page in enumerate(doc, start=1):
        page.get_pixmap(dpi=150, alpha=False).save(
            output / f"page-{number:03d}.png"
        )
```

```powershell
rtk proxy D:\MiniConda\python.exe .tmp/document-convert/render_pdf.py "C:\path\upload\large-report.pdf" ".tmp/document-convert/review"
```

逐页查看 PNG，必要时对照未压缩的 PDF。脚本的页数、逐页文字、书签、链接数量、表单数量和结构树存在性检查，只是完整性检查，不等于完整的无障碍合规验证；还应实际打开重要链接，检查阅读顺序、图表和小字。

## 上传与 Markdown 链接

通过检查后，按 [上传操作说明](uploadscript/PROMPT.md) 上传最终 PDF，使用服务器实际返回的 URL。例如：

```markdown
[Download the workshop safety protocol (PDF)](实际返回的PDF地址)
```

本地转换步骤不需要读取或保存浏览器凭证。远端目录、重名文件处理及文件命名均沿用当前上传任务的要求。

## 官方参考

- [Word ExportAsFixedFormat：PDF 导出、书签与结构标签参数](https://learn.microsoft.com/en-us/office/vba/api/word.document.exportasfixedformat)
- [PyMuPDF Document：rewrite_images 与 save 参数](https://pymupdf.readthedocs.io/en/latest/document.html)
