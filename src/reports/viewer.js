
const startViewerReport = require('../queries/viewer_info');
const appendViewerFollowersInfo = require('../queries/viewer_followersInfo.js');
const appendViewerFollowingInfo = require('../queries/viewer_followingInfo.js');
const appendViewerReposInfo = require('../queries/viewer_reposInfo.js');

module.exports = async function() {
  console.info('starting viewer report');
  return startViewerReport()
    .then(r => appendViewerFollowersInfo(r))
    .then(r => appendViewerFollowingInfo(r))
    .then(r => appendViewerReposInfo(r))
    .catch(e => console.error(e));
}
