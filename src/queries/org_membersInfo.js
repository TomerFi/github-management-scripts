const { graphql } = require('@octokit/graphql');
const { MAX_ORG_MEMBERS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { ORGANIZATION_MEMBER_CONNECTION } = require('./fragments.js')

const initialQuery = `#graphql
  query ($org: String!, $maxMembers: Int!) {
    organization (login: $org) {
      membersWithRole(first: $maxMembers) {
        ...organizationMemberConnectionFields
      }
    }
  }
  ${ORGANIZATION_MEMBER_CONNECTION}
`;

const followupQuery = `#graphql
  query ($org: String!, $maxMembers: Int!, $lastCursor: String!) {
    organization (login: $org) {
      membersWithRole(first: $maxMembers, after: $lastCursor) {
        ...organizationMemberConnectionFields
      }
    }
  }
  ${ORGANIZATION_MEMBER_CONNECTION}
`;

module.exports = async function (report) {
  console.info(`appending ${report.login} members info`);
  return getOrganizationMembersInfo(report);
}

async function getOrganizationMembersInfo(report, query, args) {
  if (!('members' in report)) {
    report.members = [];
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    org: report.login,
    maxMembers: MAX_ORG_MEMBERS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });

  response.organization.membersWithRole.edges
    .forEach(edge => {
      report.members.push({
        name: edge.node.name,
        hasTwoFactorEnabled: edge.hasTwoFactorEnabled,
        role: edge.role,
        url: edge.node.url
      });
    });

  if (!('membersTotal' in report)) {
    report.membersTotal = response.organization.membersWithRole.totalCount;
  }

  if (response.organization.membersWithRole.pageInfo.hasNextPage) {
    return getOrganizationMembersInfo(
      report,
      followupQuery,
      { lastCursor: response.organization.membersWithRole.pageInfo.endCursor });
  }
  return report;
}
