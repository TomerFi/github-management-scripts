const getOrgInfo = require('../queries/org_info.js');
const getOrgMembersInfo = require('../queries/org_membersInfo.js');
const getOrgPkgsInfo = require('../queries/org_pkgsInfo.js');
const getOrgProjectsInfo = require('../queries/org_projectsInfo.js');
const getOrgReposInfo = require('../queries/org_reposInfo.js');
const getOrgTeamsInfo = require('../queries/org_teamsInfo.js');

module.exports = buildOrgReport;

async function buildOrgReport(org) {
  return getOrgInfo(org)
    .then(s => getOrgMembersInfo(org, s))
    .then(s => getOrgPkgsInfo(org, s))
    .then(s => getOrgProjectsInfo(org, s))
    .then(s => getOrgReposInfo(org, s))
    .then(s => getOrgTeamsInfo(org, s));
}
