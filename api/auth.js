const crypto = require('crypto');

function getOrigin(request) {
  const protocol = request.headers['x-forwarded-proto'] || 'https';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  return `${protocol}://${host}`;
}

function getCookie(request, name) {
  const cookies = String(request.headers.cookie || '').split(';');
  const entry = cookies.find(cookie => cookie.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : '';
}

function setupMessage(response) {
  response.status(503).send('Dragon Dance admin login is being configured.');
}

module.exports = async (request, response) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return setupMessage(response);

  const origin = getOrigin(request);
  const redirectUri = `${origin}/api/auth`;
  const { code, state } = request.query;

  if (!code) {
    const nextState = crypto.randomBytes(24).toString('hex');
    response.setHeader('Set-Cookie', `dragon_dance_oauth_state=${nextState}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`);
    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('scope', 'repo');
    authorizeUrl.searchParams.set('state', nextState);
    response.redirect(authorizeUrl.toString());
    return;
  }

  if (!state || state !== getCookie(request, 'dragon_dance_oauth_state')) {
    response.status(400).send('Invalid sign-in request. Please return to the admin page and try again.');
    return;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept:'application/json', 'Content-Type':'application/json' },
    body: JSON.stringify({ client_id:clientId, client_secret:clientSecret, code, redirect_uri:redirectUri })
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) {
    response.status(502).send('GitHub sign-in could not be completed. Please try again.');
    return;
  }

  const message = `authorization:github:success:${JSON.stringify({ token:token.access_token, provider:'github' })}`;
  response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'");
  response.status(200).send(`<!doctype html><html><body><script>window.opener.postMessage(${JSON.stringify(message)}, ${JSON.stringify(origin)});window.close();</script></body></html>`);
};
