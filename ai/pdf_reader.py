import pypdf
import os

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a given PDF file path.
    """
    if not os.path.exists(pdf_path):
        return f"Error: File {pdf_path} not found."
    
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    except Exception as e:
        return f"Error extracting text: {str(e)}"

if __name__ == "__main__":
    # Test with a dummy path
    print(extract_text_from_pdf("sample.pdf"))
