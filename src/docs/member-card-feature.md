# Member Card Feature

## Overview
This feature adds the ability to download member ID cards directly from the member list in the library management system. The ID cards are generated as PDF files and include:

1. The entity (library) name
2. Member details including:
   - Name
   - Member ID
   - Member Type
   - Phone Number
   - Class and Division (for school members)
3. A QR code containing the Member ID for easy scanning and verification

## Components
The feature consists of the following components:

1. **Member Card Generator Button** - Added to the member list table, allowing librarians to download cards directly from the list.
2. **Member Card Generator Component** - Handles the generation and formatting of the PDF membership card.
3. **Entity Info API Endpoint** - Retrieves information about the current library entity to display on the card.

## How to Use
1. Navigate to the Members List page
2. Locate the member you want to generate a card for
3. Click the download icon in the "ID Card" column
4. The card will be automatically generated and downloaded as a PDF

## Technical Details
- The card is created using jsPDF for PDF generation
- QR codes are generated using qrcode.js
- Card dimensions are set to a standard portrait ID card size
- Authentication is required to access the member data APIs

## Customization
The card design can be customized by modifying the `member-card-generator.tsx` file. You can adjust:
- Colors
- Layout
- Font sizes
- QR code size and position

## Troubleshooting
If you encounter issues downloading cards:
1. Ensure you are logged in with appropriate permissions
2. Check that the member data is complete and valid
3. Verify that the entity (library) information is correctly set up
