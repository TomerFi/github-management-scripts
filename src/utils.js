const { html } = require('diff2html');
const { createPatch } = require('diff')
const { DEFAULT_CHARSET } = require('./common.js');
const { EOL } = require('os');

module.exports = Object.freeze({
  createEmail,
  getDiff,
  getReport,
  sendEmail,
  uploadReport,
});

// construct an html-body email object
function createEmail(title, bodyHtml) {
  return {
    Destination: {
      ToAddresses: [`${process.env.EMAIL_RECIPIENT}`]
    },
    Message: {
      Subject: {
        Charset: DEFAULT_CHARSET,
        Data: title
      },
      Body: {
        Html: {
          Charset: DEFAULT_CHARSET,
          Data: bodyHtml
        }
      }
    },
    Source: `${process.env.EMAIL_SENDER}`
  }
}

// upload report to s3
async function uploadReport(s3, bucket, key, report) {
  return s3.upload({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(JSON.stringify(report, null, 2)),
    ContentEncoding: 'base64',
    ContentType: 'application/json',
    CacheControl: 'no-cache'
  }).promise();
}

// get report from s3, or upload a new one if doesn't exist
async function getReport(s3, bucket, key, newReport) {
  try {
    let prevReportObj = await s3.getObject({Bucket: bucket, Key: key}).promise();
    return JSON.parse(prevReportObj.Body.toString(DEFAULT_CHARSET));
  } catch (e) {
    if (e.name === 'NoSuchKey') {
      await uploadReport(s3, bucket, key, newReport);
      return;
    } else {
      throw e;
    }
  }
}

// get html diff between a previous report and a current report
function getDiff(filename, previous, current) {
  let patch = createPatch(`${filename}.json`, previous, current);
  let report = html(patch, { drawFileList: false, renderNothingWhenEmpty: true });
  if (report.trim().split(EOL).length < 4) {
    // empty report returned (for reference):
    // <div class="d2h-wrapper">
    //
    // </div>
    return;
  }
  return report;
}

// send an email with the diff
async function sendEmail(ses, title, diff) {
  return ses.sendEmail(createEmail(title, diff)).promise();
}
