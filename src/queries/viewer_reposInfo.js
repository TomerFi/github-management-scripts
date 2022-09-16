const { graphql } = require('@octokit/graphql');
const { MAX_VIEWER_REPOS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { REPOSITORY_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($login: String!, $maxRepositories: Int!) {
    user (login: $login) {
      repositories(first: $maxRepositories, affiliations: OWNER, isFork: false, isLocked: false) {
        ...repositoryConnectionFields
      }
    }
  }
  ${REPOSITORY_CONNECTION}
`;

const followupQuery = `#graphql
  query ($login: String!, $maxRepositories: Int!, $lastCursor: String!) {
    user (login: $login) {
      repositories(first: $maxRepositories, affiliations: OWNER, isFork: false, isLocked: false, after: $lastCursor) {
        ...repositoryConnectionFields
      }
    }
  }
  ${REPOSITORY_CONNECTION}
`;


module.exports = async function(report) {
  console.info('viewer report - appending repositories info');
  return getUserReposInfo(report);
}

async function getUserReposInfo(report, query, args) {
  if (!('repositories' in report)) {
    report.repositories = [];
  }
  if (!('repositoriesTotalStars' in report)) {
    report.repositoriesTotalStars = 0;
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    login: report.login,
    maxRepositories: MAX_VIEWER_REPOS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });

  response.user.repositories.edges
    .forEach(edge => {
      report.repositoriesTotalStars += edge.node.stargazerCount;
      report.repositories.push({
        head: edge.node.defaultBranchRef?.name,
        forkCount: edge.node.forkCount,
        isArchived: edge.node.isArchived,
        isDisabled: edge.node.isDisabled,
        isEmpty: edge.node.isEmpty,
        isInOrganization: edge.node.isInOrganization,
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
    report.repositoriesTotal = response.user.repositories.totalCount;
  }

  if (response.user.repositories.pageInfo.hasNextPage) {
    return getUserReposInfo(
      report,
      followupQuery,
      { lastCursor: response.user.repositories.pageInfo.endCursor });
  }
  return report;
}
