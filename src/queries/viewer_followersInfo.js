const { graphql } = require('@octokit/graphql');
const { MAX_VIEWER_FOLLOWERS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { FOLLOWER_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($login: String!, $maxFollowers: Int!) {
    user (login: $login) {
      followers(first: $maxFollowers) {
        ...followerConnectionFields
      }
    }
  }
  ${FOLLOWER_CONNECTION}
`;

const followupQuery = `#graphql
  query ($login: String!, $maxFollowers: Int!, $lastCursor: String!) {
    user (login: $login) {
      followers(first: $maxFollowers, after: $lastCursor) {
        ...followerConnectionFields
      }
    }
  }
  ${FOLLOWER_CONNECTION}
`;

module.exports = getUserFollowersInfo;

async function getUserFollowersInfo(report, query, args) {
  if (!('followers' in report)) {
    report.followers = [];
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    login: report.login,
    maxFollowers: MAX_VIEWER_FOLLOWERS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });

  response.user.followers.edges
    .forEach(edge => {
      report.followers.push({
        name: edge.node.name ? edge.node.name: edge.node.login,
        url: edge.node.url
      });
    });

  if (!('followersTotal' in report)) {
    report.followersTotal = response.user.followers.totalCount;
  }

  if (response.user.followers.pageInfo.hasNextPage) {
    return getUserFollowersInfo(
      report,
      followupQuery,
      { lastCursor: response.user.followers.pageInfo.endCursor });
  }
  return report;
}
