const { S3, SES } = require('aws-sdk');
const { EMAIL_TOPIC_PREFIX, VIEWER_KEY, ORG_KEY_FMT } = require('./common.js')
const { getDiff, getReport, sendEmail, uploadReport } = require('./utils.js');
const buildViewerReport = require('./reports/viewer.js');
const buildOrgReport = require('./reports/org.js');

// eslint-disable-next-line no-unused-vars
module.exports.handler = async _event => {
  await main();
}

// check for diffs, email and update report if found
async function checkDiffs(s3, ses, currentReport, bucketName, bucketKey, isOrg) {
  let title = 'viewer';
  if (isOrg) {
    title = currentReport.login;
  }
  console.info(`${title} report - fetching previous report`);
  let previousReport = await getReport(s3, bucketName, bucketKey, currentReport);
  if (previousReport) {
    console.info(`${title} report - checking for diffs`);
    let reportsDiff = getDiff(previousReport, currentReport);
    if (reportsDiff) {
      console.info(`${title} report - found diffs`);
      await sendEmail(ses, `${EMAIL_TOPIC_PREFIX} ${title}` , reportsDiff);
      await uploadReport(s3, bucketName, bucketKey, currentReport);
    } else {
      console.info(`${title} report - no diffs found`);
    }
  } else {
    console.info(`${title} report - no previous report found`);
  }
}

async function main() {
  if (!['GITHUB_PAT', 'S3_BUCKET_NAME', 'ORGS_LIST', 'EMAIL_RECIPIENT', 'EMAIL_SENDER'].every(ev => ev in process.env)) {
    console.error('missing required environment variables');
    return;
  }

  // environment variables
  const region = `${process.env.AWS_REGION}`;
  const bucketName = `${process.env.S3_BUCKET_NAME}`;
  const orgsList = `${process.env.ORGS_LIST}`

  // apis
  const s3 = new S3({apiVersion: '2006-03-01', region: region});
  const ses = new SES({apiVersion: '2010-12-01', region: region});

  let reports = [];

  // handle viewer report
  reports.push(buildViewerReport().then(currentViewerRep => checkDiffs(s3, ses, currentViewerRep, bucketName, VIEWER_KEY)));

  // handle org reports
  if(orgsList) {
    orgsList.split(',').forEach(async org => {
      let orgKey = ORG_KEY_FMT.replace('%s', org);
      reports.push(buildOrgReport(org).then(currentOrgRep => checkDiffs(s3, ses, currentOrgRep, bucketName, orgKey, true)));
    });
  }

  // wait for reports
  await Promise.allSettled(reports);
}
