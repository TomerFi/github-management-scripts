const { S3, SES } = require('aws-sdk');
const { VIEWER_KEY, ORG_KEY_FMT } = require('./common.js')
const { getDiff, getReport, sendEmail, uploadReport } = require('./utils.js');
const buildViewerReport = require('./reports/viewer.js');
const buildOrgReport = require('./reports/org.js');

// eslint-disable-next-line no-unused-vars
module.exports = async _event => {
  await main();
}

// check for diffs, email and update report if found
async function checkDiffs(s3, ses, currentReport, bucketName, bucketKey) {
  let previousReport = await getReport(s3, bucketName, bucketKey, currentReport);
  if (previousReport) {
    let reportsDiff = getDiff(previousReport, currentReport);
    if (reportsDiff) {
      await sendEmail(ses, reportsDiff);
      await uploadReport(s3, bucketName, bucketKey, currentReport);
    }
  }
}

async function main() {
  // environment variables
  const region = `${process.env.AWS_REGION}`;
  const bucketName = `${process.env.S3_BUCKET_NAME}`;
  const orgsList = `${process.env.ORGS_LIST}`

  // apis
  const s3 = new S3({apiVersion: '2006-03-01', region: region});
  const ses = new SES({apiVersion: '2010-12-01', region: region});

  // handle viewer report
  let currentViewerRep = await buildViewerReport();
  await checkDiffs(s3, ses, currentViewerRep, bucketName, VIEWER_KEY);

  // handle org reports
  if(orgsList) {
    orgsList.split(',').forEach(async org => {
      let orgKey = ORG_KEY_FMT.replace('%s', org);
      let currentOrgRep = await buildOrgReport(org);
      await checkDiffs(s3, ses, currentOrgRep, bucketName, orgKey);
    });
  }
}
