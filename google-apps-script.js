// =================================================================
// 📋 GOOGLE APPS SCRIPT — Paste this into Google Apps Script Editor
// =================================================================
//
// SETUP STEPS:
// 1. Go to https://sheets.google.com → Create a new blank spreadsheet
// 2. Rename "Sheet1" tab to "Data" (right-click the tab → Rename)
// 3. Go to Extensions → Apps Script
// 4. Delete any code in Code.gs and paste ALL of this code
// 5. Click "Deploy" → "New Deployment"
// 6. Click the gear icon → select "Web app"
// 7. Set "Execute as" → "Me"
// 8. Set "Who has access" → "Anyone"
// 9. Click "Deploy" → Authorize when prompted
// 10. Copy the Web App URL and paste it in app.js (SCRIPT_URL)
// 11. Done! Your app now saves data to Google Drive!
//
// =================================================================

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  var data = sheet.getRange('A1').getValue();
  var output = ContentService.createTextOutput(data || '[]');
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data');
  var data = e.postData.contents;
  sheet.getRange('A1').setValue(data);
  var output = ContentService.createTextOutput(JSON.stringify({ success: true }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
