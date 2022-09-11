const { graphql } = require('@octokit/graphql');
const { MAX_VIEWER_FOLLOWING_FETCH, REQUEST_HEADERS } = require('../common.js');
const { FOLLOWING_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($login: String!, $maxFollowing: Int!) {
    user (login: $login) {
      following(first: $maxFollowing) {
        ...followingConnectionFields
      }
    }
  }
  ${FOLLOWING_CONNECTION}
`;

const followupQuery = `#graphql
  query ($login: String!, $maxFollowing: Int!, $lastCursor: String!) {
    user (login: $login) {
      following(first: $maxFollowing, after: $lastCursor) {
        ...followingConnectionFields
      }
    }
  }
  ${FOLLOWING_CONNECTION}
`;

module.exports = async function(report) {
  console.info('appending viewer following info');
  return getUserFollowingInfo(report);
}

async function getUserFollowingInfo(report, query, args) {
  if (!('following' in report)) {
    report.following = [];
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    login: report.login,
    maxFollowing: MAX_VIEWER_FOLLOWING_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });

  response.user.following.edges
    .forEach(edge => {
      report.following.push({
        name: edge.node.name ? edge.node.name: edge.node.login,
        url: edge.node.url
      });
    });

  if (!('followingTotal' in report)) {
    report.followingTotal = response.user.following.totalCount;
  }

  if (response.user.following.pageInfo.hasNextPage) {
    return getUserFollowingInfo(
      report,
      followupQuery,
      { lastCursor: response.user.following.pageInfo.endCursor });
  }
  return report;
}
