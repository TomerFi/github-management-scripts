const USER = `#graphql
  fragment userFields on User {
    name
    login
    url
  }
`;

const ORGANIZATION = `#graphql
  fragment organizationFields on Organization {
    email
    isVerified
    location
    login
    name
    requiresTwoFactorAuthentication
    url
  }
`;

const PACKAGE = `#graphql
  fragment packageFields on Package {
    name
    packageType
    latestVersion {
      version
    }
  }
`;

const PROJECT_V2 = `#graphql
  fragment projectV2Fields on ProjectV2 {
    closed
    public
    title
    url
  }
`;

const RELEASE = `#graphql
  fragment releaseFields on Release {
    name
    tagName
    url
    reactions(first: 100) {
      totalCount
    }
  }
`;

const REPOSITORY = `#graphql
  fragment repositoryFields on Repository {
    defaultBranchRef {
      name
    }
    forkCount
    isArchived
    isDisabled
    isEmpty
    isFork
    isInOrganization
    isPrivate
    name
    stargazerCount
    url
    webCommitSignoffRequired
    environments(first: 100) {
      nodes {
        name
      }
    }
    licenseInfo {
      name
    }
    latestRelease {
      ...releaseFields
    }
    discussions(first: 100) {
      totalCount
    }
    issues(first:100, states: OPEN) {
      totalCount
    }
    milestones(first:100, states: OPEN) {
      totalCount
    }
    packages(first: 100) {
      totalCount
    }
    projectsV2(first: 100) {
      totalCount
    }
    pullRequests(first:100, states: OPEN) {
      totalCount
    }
    vulnerabilityAlerts(first: 100, states: OPEN) {
      totalCount
    }
    watchers(first:100) {
      totalCount
    }
  }
  ${RELEASE}
`;

const TEAM = `#graphql
  fragment teamFields on Team {
    name
    slug
    url
  }
`;

const PAGE_INFO = `#graphql
  fragment pageInfoFields on PageInfo {
    endCursor
    hasNextPage
  }
`;

const FOLLOWER_CONNECTION = `#graphql
  fragment followerConnectionFields on FollowerConnection {
    edges {
      node {
        ...userFields
      }
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
  ${USER}
`;

const FOLLOWING_CONNECTION = `#graphql
  fragment followingConnectionFields on FollowingConnection {
    edges {
      node {
        ...userFields
      }
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
  ${USER}
`;

const ORGANIZATION_MEMBER_CONNECTION = `#graphql
  fragment organizationMemberConnectionFields on OrganizationMemberConnection {
    edges {
      hasTwoFactorEnabled
      node {
        name
        url
      }
      role
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
`;

const PACKAGE_CONNECTION = `#graphql
  fragment packageConnectionFields on PackageConnection {
    edges {
      node {
        ...packageFields
      }
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
  ${PACKAGE}
`;

const PROJECT_V2_CONNECTION = `#graphql
  fragment projectV2ConnectionFields on ProjectV2Connection {
    edges {
      node {
        ...projectV2Fields
      }
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
  ${PROJECT_V2}
`;

const REPOSITORY_CONNECTION = `#graphql
  fragment repositoryConnectionFields on RepositoryConnection {
    edges {
      node {
        ...repositoryFields
      }
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
  ${REPOSITORY}
`;

const TEAM_CONNECTION = `#graphql
  fragment teamConnectionFields on TeamConnection {
    edges {
      node {
        ...teamFields
      }
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }
  ${PAGE_INFO}
  ${TEAM}
`;

module.exports = Object.freeze({
  USER: USER,
  ORGANIZATION: ORGANIZATION,
  FOLLOWER_CONNECTION: FOLLOWER_CONNECTION,
  FOLLOWING_CONNECTION: FOLLOWING_CONNECTION,
  ORGANIZATION_MEMBER_CONNECTION: ORGANIZATION_MEMBER_CONNECTION,
  PACKAGE_CONNECTION: PACKAGE_CONNECTION,
  PROJECT_V2_CONNECTION: PROJECT_V2_CONNECTION,
  REPOSITORY_CONNECTION: REPOSITORY_CONNECTION,
  TEAM_CONNECTION: TEAM_CONNECTION,
});
