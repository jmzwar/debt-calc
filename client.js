const {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} = require("@apollo/client/core");

const clientMainnet = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix",
  }),
  cache: new InMemoryCache(),
});

const clientOptimism = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-main",
  }),
  cache: new InMemoryCache(),
});

module.exports.clientMainnet = clientMainnet;
module.exports.clientOptimism = clientOptimism;
