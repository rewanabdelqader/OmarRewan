/**
 * Omar & Rewan — RSVP receiver
 * Paste this into your Google Sheet's Apps Script editor, then deploy as a
 * Web App (see the steps Claude gave you). Each RSVP becomes a new row.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // avoid two submissions colliding

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVPs')
             || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write a header row once, if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Time', 'Name', 'Phone', 'Attending?',
        'Guests', 'Bringing kids?', 'How many kids', 'Note'
      ]);
    }

    var d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      d.fullName || '',
      d.phoneNumber || '',
      d.attendance || '',
      d.guestCount || '',
      d.bringingChildren || '',
      d.childrenCount || '',
      d.specialNotes || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
