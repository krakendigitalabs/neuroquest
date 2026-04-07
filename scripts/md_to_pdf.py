from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen.canvas import Canvas


def render_markdown_to_pdf(source_path: Path, target_path: Path) -> None:
    text = source_path.read_text(encoding="utf-8").splitlines()
    canvas = Canvas(str(target_path), pagesize=letter)
    width, height = letter
    margin = 0.75 * inch
    current_y = height - margin
    textobject = canvas.beginText(margin, current_y)
    textobject.setFont("Helvetica", 10)

    for line in text:
        potential_y = textobject.getY() - 12
        if potential_y < margin:
            canvas.drawText(textobject)
            canvas.showPage()
            textobject = canvas.beginText(margin, height - margin)
            textobject.setFont("Helvetica", 10)
        textobject.textLine(line)

    canvas.drawText(textobject)
    canvas.save()


if __name__ == "__main__":
    base_path = Path(__file__).resolve().parent.parent
    source = base_path / "docs" / "acceso-clinica-audit.md"
    target = base_path / "docs" / "acceso-clinica-audit.pdf"
    render_markdown_to_pdf(source, target)
