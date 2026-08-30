import re
from dataclasses import dataclass
from functools import lru_cache


MAX_PDF_BYTES = 15 * 1024 * 1024
MAX_PDF_PAGES = 40
MIN_EMBEDDED_TEXT_CHARS = 40


@dataclass
class ExtractedDocument:
    text: str
    page_count: int
    extraction_method: str
    confidence: float


@dataclass
class ExtractedIdentity:
    student_name: str | None
    register_number: str | None


def _meaningful_character_count(text: str) -> int:
    return len(re.findall(r"[A-Za-z0-9]", text or ""))


@lru_cache(maxsize=1)
def _ocr_engine():
    from rapidocr import RapidOCR
    return RapidOCR()

def _ocr_page(page):
    try:
        import numpy as np
        import pymupdf
    except ImportError as error:
        raise ValueError("OCR support is not installed on the API server.") from error

    pixmap = page.get_pixmap(dpi=180, colorspace=pymupdf.csRGB, alpha=False)
    image = np.frombuffer(pixmap.samples, dtype=np.uint8).reshape(
        pixmap.height, pixmap.width, pixmap.n
    )
    result = _ocr_engine()(image)
    texts = list(result.txts or ())
    scores = [float(score) for score in (result.scores or ())]
    return "\n".join(texts).strip(), (sum(scores) / len(scores) if scores else 0.0)


def extract_pdf_text(content: bytes) -> ExtractedDocument:
    if not content:
        raise ValueError("The PDF is empty.")
    if len(content) > MAX_PDF_BYTES:
        raise ValueError("PDFs must be 15 MB or smaller.")

    try:
        import pymupdf
        document = pymupdf.open(stream=content, filetype="pdf")
    except Exception as error:
        raise ValueError("The uploaded file is not a readable PDF.") from error

    try:
        if document.needs_pass:
            raise ValueError("Password-protected PDFs are not supported.")
        if document.page_count < 1:
            raise ValueError("The PDF has no pages.")
        if document.page_count > MAX_PDF_PAGES:
            raise ValueError(f"PDFs can contain at most {MAX_PDF_PAGES} pages.")

        page_texts = []
        confidences = []
        ocr_pages = 0
        for page in document:
            embedded_text = page.get_text("text", sort=True).strip()
            if _meaningful_character_count(embedded_text) >= MIN_EMBEDDED_TEXT_CHARS:
                page_texts.append(embedded_text)
                confidences.append(1.0)
                continue
            ocr_text, confidence = _ocr_page(page)
            page_texts.append(ocr_text)
            confidences.append(confidence)
            ocr_pages += 1

        full_text = "\n\n".join(text for text in page_texts if text).strip()
        if _meaningful_character_count(full_text) < 10:
            raise ValueError("No readable text could be extracted from this PDF.")
        method = "ocr" if ocr_pages == document.page_count else "hybrid" if ocr_pages else "embedded_text"
        return ExtractedDocument(
            text=full_text,
            page_count=document.page_count,
            extraction_method=method,
            confidence=round(sum(confidences) / len(confidences), 4),
        )
    finally:
        document.close()


QUESTION_HEADING = re.compile(
    r"(?im)^\s*(?:"
    r"(?:question|ques(?:tion)?|q)\s*[.:#\-]?\s*([1-9]\d{0,2}[a-z]?)\s*[\).:\-]?"
    r"|([1-9]\d{0,2}[a-z]?)\s*[\).:\-]"
    r")(?:\s+(.*))?$"
)

NAME_FIELD = re.compile(
    r"(?im)^\s*(?:student\s+)?name\s*[:\-]\s*"
    r"([a-z][a-z .'-]{1,79})\s*$"
)
REGISTER_FIELD = re.compile(
    r"(?im)^\s*(?:(?:registration|register|reg(?:istration)?|roll)\s*"
    r"(?:number|no\.?|#)?)\s*[:\-]?\s*"
    r"([a-z0-9][a-z0-9/_\-]{2,29})\s*$"
)


def extract_student_identity(text: str) -> ExtractedIdentity:
    """Read labelled student identity fields from an OCR/embedded-text header."""
    header = "\n".join((text or "").replace("\r", "\n").splitlines()[:20])
    name_match = NAME_FIELD.search(header)
    register_match = REGISTER_FIELD.search(header)
    name = re.sub(r"\s+", " ", name_match.group(1)).strip(" .-") if name_match else None
    register_number = register_match.group(1).strip().upper() if register_match else None
    return ExtractedIdentity(student_name=name or None, register_number=register_number or None)


def split_question_blocks(text: str) -> list[dict]:
    """Split OCR text at Q1 / Question 1 / 1. headings while preserving all content."""
    clean_text = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    matches = list(QUESTION_HEADING.finditer(clean_text))
    if not matches:
        return [{"question_number": "1", "label": "Q1", "text": clean_text, "block_order": 1}]

    blocks = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(clean_text)
        block_text = clean_text[start:end].strip()
        number = (match.group(1) or match.group(2)).upper()
        if block_text:
            blocks.append({
                "question_number": number,
                "label": f"Q{number}",
                "text": block_text,
                "block_order": len(blocks) + 1,
            })
    if not blocks:
        return [{"question_number": "1", "label": "Q1", "text": clean_text, "block_order": 1}]
    merged = []
    by_number = {}
    for block in blocks:
        existing = by_number.get(block["question_number"])
        if existing:
            existing["text"] = f'{existing["text"]}\n{block["text"]}'
        else:
            block["block_order"] = len(merged) + 1
            by_number[block["question_number"]] = block
            merged.append(block)
    return merged
