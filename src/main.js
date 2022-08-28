const { S3, SES } = require('aws-sdk');
const { VIEWER_KEY, ORG_KEY_FMT } = require('./common.js')
const { getDiff, getReport, sendEmail, uploadReport } = require('./utils.js');
const buildViewerReport = require('./reports/viewer.js');
const buildOrgReport = require('./reports/org.js');

// eslint-disable-next-line no-unused-vars
exports.handler = async (_event) => {
  await main();
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
  let prevViewerRep = await getReport(s3, bucketName, VIEWER_KEY, currentViewerRep);
  if (prevViewerRep) {
    let viewerDiff = getDiff(prevViewerRep, currentViewerRep);
    if (viewerDiff) {
      await sendEmail(ses, viewerDiff)
        .then(() => uploadReport(s3, bucketName, VIEWER_KEY, currentViewerRep));
    }
  }

  // handle org reports
  if(orgsList) {
    orgsList.split(',').forEach(async org => {
      let orgKey = ORG_KEY_FMT.replace('%s', org.replace('-', '_'));
      let currentOrgRep = await buildOrgReport(org);
      let prevOrgRep = await getReport(s3, bucketName, orgKey, currentOrgRep);
      if (prevOrgRep) {
        let orgDiff = getDiff(prevOrgRep, currentOrgRep);
        if(orgDiff) {
          await sendEmail(ses, orgDiff)
            .then(() => uploadReport(s3, bucketName, orgKey, currentOrgRep));
        }
      }
    });
  }
}
