const { gql } = require("@apollo/client/core");

exports.GET_ISSUEDS = gql`
  query Issueds(
    $where: Issued_filter
    $orderBy: Issued_orderBy
    $orderDirection: OrderDirection
    $skip: Int
    $first: Int
  ) {
    issueds(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      skip: $skip
      first: $first
    ) {
      id
      value
      timestamp
      source
      block
    }
  }
`;

exports.GET_BURNEDS = gql`
  query Burneds(
    $where: Burned_filter
    $orderBy: Burned_orderBy
    $orderDirection: OrderDirection
    $skip: Int
    $first: Int
  ) {
    burneds(
      where: $where
      orderBy: $orderBy
      orderDirection: $orderDirection
      skip: $skip
      first: $first
    ) {
      id
      value
      timestamp
      source
      block
    }
  }
`;
