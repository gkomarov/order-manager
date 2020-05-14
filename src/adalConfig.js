import { AuthenticationContext } from 'react-adal';

const rootUrl = window.location.origin;

const adalConfig = credentials => {
  return {
      tenant: credentials.aadTenantId,
      clientId: credentials.aadClientId,
      endpoints: {
        api: `${credentials.aadInstance}${credentials.aadClientId}`
      },
      postLogoutRedirectUri: rootUrl,
      redirectUri: `${rootUrl}/${credentials.aadCallbackPath}`,
      cacheLocation: 'sessionStorage'
    }
}

export const authContext = credentials => new AuthenticationContext(adalConfig(credentials));



