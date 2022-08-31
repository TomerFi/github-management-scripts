const { graphql } = require('@octokit/graphql');
const { MAX_ORG_REPOS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { REPOSITORY_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($org: String!, $maxRepositories: Int!) {
    organization (login: $org) {
      repositories(first: $maxRepositories, ownerAffiliations: OWNER) {
        ...repositoryConnectionFields
      }
    }
  }
  ${REPOSITORY_CONNECTION}
`;

const followupQuery = `#graphql
  query ($org: String!, $maxRepositories: Int!, $lastCursor: String!) {
    organization (login: $org) {
      repositories(first: $maxRepositories, ownerAffiliations: OWNER, after: $lastCursor) {
        ...repositoryConnectionFields
      }
    }
  }
  ${REPOSITORY_CONNECTION}
`;

module.exports = getOrganizationReposInfo;

async function getOrganizationReposInfo(report, query, args) {
  if (!('repositories' in report)) {
    report.repositories = [];
  }
  if (!('repositoriesTotalStars' in report)) {
    report.repositoriesTotalStars = 0;
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    org: report.login,
    maxRepositories: MAX_ORG_REPOS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });

  response.organization.repositories.edges
    .forEach(edge => {
      report.repositoriesTotalStars += edge.node.stargazerCount;
      report.repositories.push({
        head: edge.node.defaultBranchRef?.name,
        forkCount: edge.node.forkCount,
        isArchived: edge.node.isArchived,
        isDisabled: edge.node.isDisabled,
        isEmpty: edge.node.isEmpty,
        isFork: edge.node.isFork,
        isPrivate: edge.node.isPrivate,
        name: edge.node.name,
        stargazersTotal: edge.node.stargazerCount,
        discussions: edge.node.discussions.totalCount,
        environments: edge.node.environments.nodes.map(n => n.name),
        issues: edge.node.issues.totalCount,
        latest: {
          name: edge.node.latestRelease?.name ? edge.node.latestRelease.name : edge.node.latestRelease?.tagName,
          url: edge.node.latestRelease?.url,
          reactions: edge.node.latest?.release.reactions.totalCount,
        },
        license: edge.node?.licenseInfo?.name,
        milestones: edge.node.milestones.totalCount,
        packages: edge.node.packages.totalCount,
        projects: edge.node.projectsV2.totalCount,
        pullRequests: edge.node.pullRequests.totalCount,
        url: edge.node.url,
        vulnerabilitiesTotal: edge.node.vulnerabilityAlerts.totalCount,
        webCommitSignoffRequired: edge.node.webCommitSignoffRequired,
        watchers: edge.node.watchers.totalCount,
      });
    });

  if (!('repositoriesTotal' in report)) {
    report.repositoriesTotal = response.organization.repositories.totalCount;
  }

  if (response.organization.repositories.pageInfo.hasNextPage) {
    return getOrganizationReposInfo(
      report,
      followupQuery,
      { lastCursor: response.organization.repositories.pageInfo.endCursor });
  }
  return report;
}
