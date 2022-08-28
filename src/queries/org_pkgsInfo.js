const { graphql } = require('@octokit/graphql');
const { MAX_ORG_PKGS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(org, report) {
  return getOrganizationPackagesInfo(org, report, `first: ${MAX_ORG_PKGS_FETCH}`);
}

async function getOrganizationPackagesInfo(org, report, packages) {
  if (!('packages' in report)) {
    report.packages = [];
  }
  if (!('info' in report)) {
    report.info.packages = 0;
  } else {
    if (!('packages' in report.info)) {
      report.info.packages = 0;
    }
  }
  let query = `
    {
      organization (login: "${org}") {
        packages(${packages}) {
          edges {
            node {
              name
              packageType
              latestVersion {
                version
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
          totalCount
        }
      }
    }
  `;

  let result = await graphql(query, REQUEST_PARAMS);

  result.organization.packages.edges
    .forEach(edge => {
      report.packages.push({
        name: edge.node.name,
        packageType: edge.node.packageType,
        latestVersion: edge.node.latestVersion.version,
      });
    });

  report.info.packages = result.organization.packages.totalCount;

  if (result.organization.packages.pageInfo.hasNextPage) {
    return getOrganizationPackagesInfo(
      org,
      report,
      `first: ${MAX_ORG_PKGS_FETCH}, after: "${result.organization.packages.pageInfo.endCursor}"`)
  }
  return report;
}
