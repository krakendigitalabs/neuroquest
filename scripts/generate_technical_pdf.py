from __future__ import annotations

from pathlib import Path
import textwrap


ROOT = Path(__file__).resolve().parent.parent
PAGE_WIDTH = 595
PAGE_HEIGHT = 842
LEFT = 48
TOP = 802
BOTTOM = 48
LINE_HEIGHT = 14
BODY_SIZE = 11
HEADING_SIZE = 18
SUBHEADING_SIZE = 13
MONO_SIZE = 9
WRAP = 92
CODE_WRAP = 78


def clean_inline(text: str) -> str:
    return (
        text.replace("`", "")
        .replace("**", "")
        .replace("*", "")
    )


def parse_markdown(md: str) -> list[tuple[str, str]]:
    lines = md.splitlines()
    tokens: list[tuple[str, str]] = []
    in_code = False
    code_buffer: list[str] = []

    def flush_code() -> None:
      nonlocal code_buffer
      if code_buffer:
          for line in code_buffer:
              tokens.append(("code", line.rstrip()))
          tokens.append(("blank", ""))
          code_buffer = []

    for raw in lines:
        line = raw.rstrip("\n")
        if line.startswith("```"):
            if in_code:
                flush_code()
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_buffer.append(line)
            continue

        stripped = line.strip()
        if not stripped:
            tokens.append(("blank", ""))
            continue

        if stripped.startswith("# "):
            tokens.append(("h1", clean_inline(stripped[2:].strip())))
            continue
        if stripped.startswith("## "):
            tokens.append(("h2", clean_inline(stripped[3:].strip())))
            continue
        if stripped.startswith("### "):
            tokens.append(("h3", clean_inline(stripped[4:].strip())))
            continue
        if stripped.startswith("- "):
            tokens.append(("bullet", clean_inline(stripped[2:].strip())))
            continue
        if stripped[:2].isdigit() and stripped[1:3] == ". ":
            tokens.append(("bullet", clean_inline(stripped[3:].strip())))
            continue

        tokens.append(("p", clean_inline(stripped)))

    if in_code:
        flush_code()
    return tokens


def wrap_tokens(tokens: list[tuple[str, str]]) -> list[tuple[str, str]]:
    wrapped: list[tuple[str, str]] = []
    for kind, text in tokens:
        if kind in {"blank", "h1", "h2", "h3"}:
            wrapped.append((kind, text))
            continue
        if kind == "code":
            if not text:
                wrapped.append(("code", ""))
            else:
                for line in textwrap.wrap(text, width=CODE_WRAP, replace_whitespace=False, drop_whitespace=False) or [""]:
                    wrapped.append(("code", line))
            continue
        if kind == "bullet":
            lines = textwrap.wrap(text, width=WRAP - 2) or [""]
            for index, line in enumerate(lines):
                wrapped.append(("bullet", ("- " if index == 0 else "  ") + line))
            continue
        for line in textwrap.wrap(text, width=WRAP) or [""]:
            wrapped.append(("p", line))
    return wrapped


def pdf_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def tokens_to_pages(tokens: list[tuple[str, str]]) -> list[list[tuple[str, str]]]:
    pages: list[list[tuple[str, str]]] = []
    page: list[tuple[str, str]] = []
    y = TOP

    def space_for(kind: str) -> int:
        if kind == "h1":
            return 28
        if kind == "h2":
            return 22
        if kind == "h3":
            return 18
        if kind == "blank":
            return 10
        return LINE_HEIGHT

    for token in tokens:
        needed = space_for(token[0])
        if y - needed < BOTTOM and page:
            pages.append(page)
            page = []
            y = TOP
        page.append(token)
        y -= needed

    if page:
        pages.append(page)
    return pages


def build_cover_stream(title: str, subtitle: str) -> bytes:
    commands: list[str] = []

    def text(font: str, size: int, x: int, y_pos: int, value: str) -> None:
        commands.append(f"BT /{font} {size} Tf 1 0 0 1 {x} {y_pos} Tm ({pdf_escape(value)}) Tj ET")

    commands.append("0.93 0.97 0.98 rg 0 0 595 842 re f")
    commands.append("0.43 0.67 0.84 rg 48 710 499 70 re f")
    text("F2", 28, 60, 745, title)
    text("F2", 20, 60, 660, subtitle)
    text("F1", 12, 60, 620, "Arquitectura, procesos, logica y decisiones de diseno")
    text("F1", 11, 60, 570, "Producto: NeuroQuest")
    text("F1", 11, 60, 552, "Stack: Next.js, React, TypeScript, Firebase, Vercel")
    text("F1", 11, 60, 534, "Fecha de generacion automatica desde el repositorio")
    text("F1", 10, 60, 70, "Documento generado localmente desde C:\\neuroquest")
    return "\n".join(commands).encode("latin-1", errors="replace")


def build_page_stream(page_tokens: list[tuple[str, str]], page_no: int, total_pages: int, footer_title: str) -> bytes:
    commands: list[str] = []
    y = TOP

    def text(font: str, size: int, x: int, y_pos: int, value: str) -> None:
        commands.append(f"BT /{font} {size} Tf 1 0 0 1 {x} {y_pos} Tm ({pdf_escape(value)}) Tj ET")

    for kind, value in page_tokens:
        if kind == "blank":
            y -= 10
        elif kind == "h1":
            text("F2", HEADING_SIZE, LEFT, y, value)
            y -= 28
        elif kind == "h2":
            text("F2", SUBHEADING_SIZE, LEFT, y, value)
            y -= 22
        elif kind == "h3":
            text("F2", 11, LEFT, y, value)
            y -= 18
        elif kind == "code":
            text("F3", MONO_SIZE, LEFT + 8, y, value)
            y -= LINE_HEIGHT
        else:
            text("F1", BODY_SIZE, LEFT, y, value)
            y -= LINE_HEIGHT

    footer = f"{footer_title} - Pagina {page_no}/{total_pages}"
    text("F1", 9, LEFT, 24, footer)
    return "\n".join(commands).encode("latin-1", errors="replace")


def build_pdf(pages: list[bytes]) -> bytes:
    objects: list[bytes] = []

    def add(obj: bytes) -> int:
        objects.append(obj)
        return len(objects)

    font1 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font2 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font3 = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    page_ids: list[int] = []
    content_ids: list[int] = []
    pages_id_placeholder = len(objects) + 1
    add(b"")

    for stream in pages:
        content = (
            f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1")
            + stream
            + b"\nendstream"
        )
        content_id = add(content)
        content_ids.append(content_id)
        page_obj = (
            f"<< /Type /Page /Parent {pages_id_placeholder} 0 R "
            f"/MediaBox [0 0 {PAGE_WIDTH} {PAGE_HEIGHT}] "
            f"/Resources << /Font << /F1 {font1} 0 R /F2 {font2} 0 R /F3 {font3} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        ).encode("latin-1")
        page_ids.append(add(page_obj))

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[pages_id_placeholder - 1] = (
        f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>".encode("latin-1")
    )
    catalog_id = add(f"<< /Type /Catalog /Pages {pages_id_placeholder} 0 R >>".encode("latin-1"))

    output = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(output))
        output.extend(f"{idx} 0 obj\n".encode("latin-1"))
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_start = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    output.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_start}\n%%EOF".encode(
            "latin-1"
        )
    )
    return bytes(output)


def render_document(source: Path, output: Path) -> None:
    md = source.read_text(encoding="utf-8")
    tokens = parse_markdown(md)
    title = tokens[0][1] if tokens and tokens[0][0] == "h1" else "NeuroQuest"
    subtitle = tokens[1][1] if len(tokens) > 1 and tokens[1][0] in {"h2", "h3"} else "Documento"
    wrapped = wrap_tokens(tokens)
    pages_tokens = tokens_to_pages(wrapped)
    footer_title = f"{title} - {subtitle}"
    streams = [build_cover_stream(title, subtitle)]
    streams.extend(
        build_page_stream(page, index + 2, len(pages_tokens) + 1, footer_title)
        for index, page in enumerate(pages_tokens)
    )
    pdf_bytes = build_pdf(streams)
    output.write_bytes(pdf_bytes)
    print(f"PDF generated: {output}")


def main() -> None:
    render_document(
        ROOT / "docs" / "solucion-tecnica-neuroquest.md",
        ROOT / "docs" / "solucion-tecnica-neuroquest.pdf",
    )
    render_document(
        ROOT / "docs" / "solucion-ejecutiva-neuroquest.md",
        ROOT / "docs" / "solucion-ejecutiva-neuroquest.pdf",
    )


if __name__ == "__main__":
    main()
