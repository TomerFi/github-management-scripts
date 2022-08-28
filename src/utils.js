const { html } = require('diff2html');
const { diffLines, formatLines } = require('unidiff');
const { DEFAULT_CHARSET, EMAIL_TOPIC } = require('./common.js');

module.exports = {
  createEmail: createEmail,
  getDiff: getDiff,
  getReport: getReport,
  sendEmail: sendEmail,
  uploadReport: uploadReport
}

// construct an html-body email object
function createEmail(bodyHtml) {
  return {
    Destination: {
      ToAddresses: [`${process.env.EMAIL_RECIPIENT}`]
    },
    Message: {
      Subject: {
        Charset: DEFAULT_CHARSET,
        Data: EMAIL_TOPIC
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
    return prevReportObj.Body.toString(DEFAULT_CHARSET);
  } catch (e) {
    if (e.name === 'NoSuchKey') {
      await uploadReport(s3, bucket, key, newReport);
      return;
    } else {
      return e;
    }
  }
}

// get diff between a previous report and a current report
function getDiff(previousReport, currentReport) {
  let diffs = diffLines(previousReport, JSON.stringify(currentReport, null, 2))
  if(diffs.length > 0) {
    return html(formatLines(diffs));
  }
}

// send an email with the diff
async function sendEmail(ses, diff) {
  return ses.sendEmail(createEmail(diff)).promise();
}
