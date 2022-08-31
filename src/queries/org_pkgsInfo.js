const { graphql } = require('@octokit/graphql');
const { MAX_ORG_PKGS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { PACKAGE_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($org: String!, $maxPackages: Int!) {
    organization (login: $org) {
      packages(first: $maxPackages) {
        ...packageConnectionFields
      }
    }
  }
  ${PACKAGE_CONNECTION}
`;

const followupQuery = `#graphql
  query ($org: String!, $maxPackages: Int!, $lastCursor: String!) {
    organization (login: $org) {
      packages(first: $maxPackages, after: $lastCursor) {
        ...packageConnectionFields
      }
    }
  }
  ${PACKAGE_CONNECTION}
`;

module.exports = getOrganizationPackagesInfo;

async function getOrganizationPackagesInfo(report, query, args) {
  if (!('packages' in report)) {
    report.packages = [];
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    org: report.login,
    maxPackages: MAX_ORG_PKGS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });


  response.organization.packages.edges
    .forEach(edge => {
      report.packages.push({
        name: edge.node.name,
        packageType: edge.node.packageType,
        latestVersion: edge.node.latestVersion.version,
      });
    });

  if (!('packagesTotal' in report)) {
    report.packagesTotal = response.organization.packages.totalCount;
  }

  if (response.organization.packages.pageInfo.hasNextPage) {
    return getOrganizationPackagesInfo(
      report,
      followupQuery,
      { lastCursor: response.organization.packages.pageInfo.endCursor });
  }
  return report;
}
