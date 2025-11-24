# New Features

## 1. Extended File Format Support with OCR

### Overview
The system now supports image file formats (JPEG, PNG, BMP, GIF) in addition to PDF and TXT files. Images are processed using OCR (Optical Character Recognition) to extract text.

### Implementation
- **Backend**: Uses EasyOCR library for text extraction from images
- **Supported Formats**: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.gif`
- **Processing**: Images are converted to text using OCR, then processed like regular documents (chunked, embedded, stored)

### Usage
1. Navigate to `/admin`
2. Click "Upload Document"
3. Select an image file (JPEG, PNG, etc.)
4. Choose policy area (IT, HR, or General)
5. Upload - the system will automatically extract text using OCR

### Technical Details
- OCR uses EasyOCR with English language support
- Low-confidence detections (< 0.5) are filtered out
- First-time OCR initialization may take a moment to download models
- Works on both CPU and GPU (auto-detected)

## 2. Answer History with Exploration View

### Overview
Users can now explore their query history in detail, including the complete multi-agent debate flow. This allows users to see how the IT and HR policy experts analyzed their question and how their perspectives were synthesized.

### Features
- **History Sidebar**: Click any query to view detailed analysis
- **Debate Flow View**: See IT Expert and HR Expert responses separately
- **Context Display**: View the policy chunks used by each expert
- **Source Tracking**: See which documents were referenced

### Implementation
- **Database Schema**: Extended to store `itExpertResponse`, `hrExpertResponse`, `itContext`, `hrContext`
- **UI Components**: 
  - History detail page at `/history/[id]`
  - Accordion-based exploration view
  - Color-coded expert responses (IT = blue, HR = green)

### Usage
1. View query history in the sidebar on the dashboard
2. Click any query to open the detailed view
3. Explore the debate flow:
   - **Final Answer**: The synthesized response
   - **IT Policy Expert Analysis**: Expandable section showing IT expert's perspective
   - **HR Policy Expert Analysis**: Expandable section showing HR expert's perspective
   - **Information Sources**: List of documents referenced

### UI Features
- **Accordion Interface**: Collapsible sections for each expert's analysis
- **Context Preview**: See the policy chunks that informed each expert
- **Visual Distinction**: Color-coded sections for IT (blue) and HR (green) experts
- **Back Navigation**: Easy return to dashboard

## Technical Changes

### Backend
- Added `easyocr` and `Pillow` to requirements
- Updated `document_processor.py` to handle image files
- Modified `agentic_debate.py` to return expert responses
- Updated API response to include debate flow data

### Frontend
- Extended `Query` type to include debate flow fields
- Updated `addQueryToHistory` to store full debate flow
- Created `/history/[id]` page for detailed view
- Updated history sidebar to link to detail pages
- Enhanced admin page to accept image files

### Database
- Firestore documents now include optional fields:
  - `itExpertResponse`: IT expert's analysis
  - `hrExpertResponse`: HR expert's analysis
  - `itContext`: Array of IT policy chunks used
  - `hrContext`: Array of HR policy chunks used
- Backward compatible with existing queries (fields are optional)

## Future Enhancements
- Export debate flow as PDF
- Compare multiple query responses
- Search history by policy area or date
- Visual timeline of query history

