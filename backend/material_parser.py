import io
import os
import re
from typing import List, Dict, Any, Optional

try:
    import pymupdf
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False


class MaterialParser:
    """
    Enterprise Document Parser.
    Extracts, cleans, and structures raw content from PDFs, Markdown, and Plain Text files
    into standardized semantic sections and chunks for RAG vectorization and LLM theory processing.
    Equipped with PyMuPDF high-speed extraction engine and pypdf fallback.
    """

    @staticmethod
    def extract_text_from_pdf_bytes(pdf_bytes: bytes, max_pages: int = 80) -> str:
        """Extracts text content from in-memory PDF binary stream with high speed & error tolerance."""
        extracted_pages = []

        # 1. Primary High-Speed Engine: PyMuPDF (fitz)
        if PYMUPDF_AVAILABLE:
            try:
                doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
                total_pages = len(doc)
                for idx in range(min(total_pages, max_pages)):
                    try:
                        page = doc.load_page(idx)
                        text = page.get_text("text").strip()
                        if text:
                            extracted_pages.append(f"--- Page {idx + 1} ---\n{text}")
                    except Exception as pe:
                        print(f"[PyMuPDF] Skipping page {idx+1}: {pe}")
                if extracted_pages:
                    return "\n\n".join(extracted_pages)
            except Exception as me:
                print(f"[PyMuPDF] Stream extraction error: {me}. Falling back to pypdf.")

        # 2. Secondary Engine: pypdf
        if PYPDF_AVAILABLE:
            pdf_file = io.BytesIO(pdf_bytes)
            try:
                reader = pypdf.PdfReader(pdf_file)
            except Exception as e:
                raise ValueError(f"Unable to parse PDF stream: {str(e)}")

            total_pages = len(reader.pages)
            for idx, page in enumerate(reader.pages):
                if idx >= max_pages:
                    break
                try:
                    text = page.extract_text() or ""
                    text = text.strip()
                    if text:
                        extracted_pages.append(f"--- Page {idx + 1} ---\n{text}")
                except Exception as e:
                    print(f"[pypdf] Skipping page {idx + 1}: {e}")
                    
            if extracted_pages:
                return "\n\n".join(extracted_pages)

        if not extracted_pages:
            raise RuntimeError("Neither PyMuPDF nor pypdf could extract readable text from this PDF file.")

        return "\n\n".join(extracted_pages)

    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """Extracts text from a given file path on disk."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            with open(file_path, "rb") as f:
                return MaterialParser.extract_text_from_pdf_bytes(f.read())
        else:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return f.read()

    @staticmethod
    def clean_text(raw_text: str) -> str:
        """Sanitizes text by stripping header/footer noise, page artifacts, and irregular whitespace."""
        text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
        # Remove repeated page markers
        text = re.sub(r"--- Page \d+ ---", "", text)
        # Normalize multiple blank lines to double newline
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Remove non-printable control characters except standard whitespace
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        return text.strip()

    # Regex patterns for non-theory sections (Appendix, Bibliography, Solutions, Front-matter)
    NON_THEORY_SECTION_PATTERN = re.compile(
        r"^(?:Appendix(?:\s+[A-Z0-9]+)?|Appendices|Bibliography|References|Works\s+Cited|Glossary|Index(?:\s+of\s+Terms)?|Solutions\s+(?:to|for)|Answers\s+to|Table\s+of\s+Contents|TOC|Preface|Foreword|Dedication|Acknowledgements|Copyright|Publisher|About\s+the\s+Authors?)\b",
        re.IGNORECASE
    )

    @classmethod
    def is_non_theory_section(cls, title: str) -> bool:
        """Determines whether a detected section heading is an appendix, front-matter, or index clutter."""
        clean_title = title.strip().lstrip("#").strip()
        return bool(cls.NON_THEORY_SECTION_PATTERN.search(clean_title))

    @staticmethod
    def detect_outline_or_chapters(text: str) -> List[Dict[str, Any]]:
        """
        Attempts to detect logical chapters/sections in text using headings or regex patterns.
        Filters out Front-Matter (Preface, TOC) and Back-Matter (Appendixes, Solutions, Index, Bibliography)
        to isolate 100% pure core instructional theory across massive books.
        """
        cleaned = MaterialParser.clean_text(text)
        
        # Pattern for Textbook chapters, Markdown headers, and Research Paper Roman/Numeric Sections
        pattern = re.compile(
            r"(?:^|\n)(#{1,3}\s+|Chapter\s+\d+[:\s\-\.]+|Unit\s+\d+[:\s\-\.]+|Module\s+\d+[:\s\-\.]+|Section\s+\d+[:\s\-\.]+|[0-9]+\.[0-9]*\s+|[I|V|X]+\.\s+|Abstract\b|Introduction\b|Methodology\b|Experiments\b|Results\b|Discussion\b|Conclusion\b|Appendix\s+[A-Z0-9]+|Appendices\b|Glossary\b|References\b|Bibliography\b|Index\b)([^\n]{0,80})(?:\n|$)",
            re.IGNORECASE
        )
        
        matches = list(pattern.finditer(cleaned))
        raw_sections: List[Dict[str, Any]] = []
        
        if len(matches) >= 2:
            for i, match in enumerate(matches):
                title_prefix = match.group(1).strip()
                title_text = match.group(2).strip()
                full_title = f"{title_prefix} {title_text}".strip().lstrip("#").strip()
                if len(full_title) < 4:
                    continue
                
                start_pos = match.end()
                end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(cleaned)
                content = cleaned[start_pos:end_pos].strip()
                
                if len(content) > 60:
                    raw_sections.append({
                        "title": full_title,
                        "content": content
                    })
                    
        # Filter out non-theory sections (Appendixes, Front-matter, Bibliographies, Solution Keys)
        theory_chapters: List[Dict[str, Any]] = []
        for s in raw_sections:
            if MaterialParser.is_non_theory_section(s["title"]):
                print(f"[MaterialParser] Pruned non-theory section: '{s['title']}'")
                continue
            theory_chapters.append({
                "chapter_index": len(theory_chapters) + 1,
                "title": s["title"],
                "content": s["content"]
            })
                    
        # If no explicit chapter structure detected or all were filtered, create logical structural slices
        if not theory_chapters:
            paragraphs = [p.strip() for p in cleaned.split("\n\n") if len(p.strip()) > 30]
            if not paragraphs:
                paragraphs = [cleaned]
                
            chunk_size = max(1, len(paragraphs) // 4) if len(paragraphs) > 4 else len(paragraphs)
            slice_idx = 1
            for i in range(0, len(paragraphs), chunk_size):
                chunk_slice = "\n\n".join(paragraphs[i:i + chunk_size])
                first_sentence = chunk_slice.split("\n")[0][:60].strip()
                title = f"Chapter {slice_idx}: {first_sentence}" if len(first_sentence) > 10 else f"Chapter {slice_idx}: Key Concepts"
                theory_chapters.append({
                    "chapter_index": slice_idx,
                    "title": title,
                    "content": chunk_slice
                })
                slice_idx += 1
                if slice_idx > 8:  # Cap at 8 chapters for fallback
                    break

        return theory_chapters

    @staticmethod
    def create_semantic_chunks(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
        """Creates semantic paragraph chunks suitable for ChromaDB vector embeddings."""
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
        chunks: List[str] = []
        
        current_chunk = []
        current_length = 0
        
        for p in paragraphs:
            p_words = len(p.split())
            if current_length + p_words <= chunk_size:
                current_chunk.append(p)
                current_length += p_words
            else:
                if current_chunk:
                    chunks.append("\n\n".join(current_chunk))
                current_chunk = [p]
                current_length = p_words
                
        if current_chunk:
            chunks.append("\n\n".join(current_chunk))
            
        return chunks if chunks else [text[:1000]]
