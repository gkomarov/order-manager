import { runWithAdal } from 'react-adal';
import { authContext } from './adalConfig';

const DO_NOT_LOGIN = false;

const rootUrl = window.location.origin;

let authContextWithCredentials = null;

const adalInitialize = () => {
  runWithAdal(authContextWithCredentials, () => {

    // eslint-disable-next-line
    require('./indexApp.js');
  
  },DO_NOT_LOGIN);
}

if (!authContextWithCredentials) {
  fetch(`${rootUrl}/.adal-config`).then(response => {
    return response.json();
  })
  .then(credentials => {
    authContextWithCredentials = authContext(credentials);
    adalInitialize();
  });
} else {
  adalInitialize();
}

export const getToken = () => {
  console.info("get token: ", authContextWithCredentials);
  authContextWithCredentials.acquireToken(authContextWithCredentials.config.clientId, (res) => { console.info(res) });
  return authContextWithCredentials.getCachedToken(authContextWithCredentials.config.clientId);
};

export const logOut = () => {
  authContextWithCredentials.logOut();
}