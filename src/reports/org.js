const getOrgInfo = require('../queries/org_info.js');
const getOrgMembersInfo = require('../queries/org_membersInfo.js');
const getOrgPkgsInfo = require('../queries/org_pkgsInfo.js');
const getOrgProjectsInfo = require('../queries/org_projectsInfo.js');
const getOrgReposInfo = require('../queries/org_reposInfo.js');
const getOrgTeamsInfo = require('../queries/org_teamsInfo.js');

module.exports = async function(org) {
  return getOrgInfo(org)
    .then(r => getOrgMembersInfo(r))
    .then(r => getOrgPkgsInfo(r))
    .then(r => getOrgProjectsInfo(r))
    .then(r => getOrgReposInfo(r))
    .then(r => getOrgTeamsInfo(r));
}
