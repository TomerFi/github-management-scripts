const startOrgReport = require('../queries/org_info.js');
const appendOrgMembersInfo = require('../queries/org_membersInfo.js');
const appendOrgPkgsInfo = require('../queries/org_pkgsInfo.js');
const appendOrgProjectsInfo = require('../queries/org_projectsInfo.js');
const appendOrgReposInfo = require('../queries/org_reposInfo.js');
const appendOrgTeamsInfo = require('../queries/org_teamsInfo.js');

module.exports = async function(org) {
  console.info(`starting ${org} report`);
  return startOrgReport(org)
    .then(r => appendOrgMembersInfo(r))
    .then(r => appendOrgPkgsInfo(r))
    .then(r => appendOrgProjectsInfo(r))
    .then(r => appendOrgReposInfo(r))
    .then(r => appendOrgTeamsInfo(r))
    .catch(e => console.error(e));
}
