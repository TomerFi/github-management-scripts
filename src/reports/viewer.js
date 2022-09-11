
const getViewerInfo = require('../queries/viewer_info');
const getViewerFollowersInfo = require('../queries/viewer_followersInfo.js');
const getViewerFollowingInfo = require('../queries/viewer_followingInfo.js');
const getViewerReposInfo = require('../queries/viewer_reposInfo.js');

module.exports = async function() {
  console.info('building viewer report');
  return getViewerInfo()
    .then(r => getViewerFollowersInfo(r))
    .then(r => getViewerFollowingInfo(r))
    .then(r => getViewerReposInfo(r))
    .catch(e => console.error(e));
}
