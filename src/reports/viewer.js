
const getViewerInfo = require('../queries/viewer_info');
const getViewerFollowersInfo = require('../queries/viewer_followersInfo.js');
const getViewerFollowingInfo = require('../queries/viewer_followingInfo.js');
const getViewerReposInfo = require('../queries/viewer_reposInfo.js');

module.exports = viewerReportBuilder;

async function viewerReportBuilder() {
  return getViewerInfo()
    .then(r => getViewerFollowersInfo(r))
    .then(r => getViewerFollowingInfo(r))
    .then(r => getViewerReposInfo(r));
}
