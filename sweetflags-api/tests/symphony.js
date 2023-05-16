import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://sweetflags.dev.gcp.sweetwater.com/api';
const BASE_AUTH0_URL = 'https://dev-sweetwater-internal.us.auth0.com/oauth/token';
let token;

export let options = {
    vus: 2,  // Number of virtual users
    duration: '5m',  // Test duration
};

export function setup() {
    // get access token
    let res = http.post(BASE_AUTH0_URL, JSON.stringify({
        client_id: '4oE6I2AfQ7IFN9wA41hwOghCpHL2gJ5V',
        client_secret: '-mIPkelC3Iby-kBeLwqN53qmqjzdLfI9R83il0BJKYfaEYodMfZ-WPLNTq2zt6ug',
        audience: 'urn:sweetflags-api',
        grant_type: 'client_credentials',
    }), { headers: { 'Content-Type': 'application/json' } });

    check(res, {
        'successfully retrieved token': (resp) => resp.json('access_token') !== '',
    });
    token = res.json('access_token'); 

    let headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // get apps
    res = http.get(`${BASE_URL}/apps`, { headers: headers });
    check(res, { 'status was 200 for /apps': (r) => r.status == 200 });

    // find Symphony in the response
    let symphony = res.json().find((app) => app.name === 'Symphony');
    check(symphony, { 'Symphony app was found': (r) => r !== undefined });

    // get environments for Symphony
    res = http.get(`${BASE_URL}/environments/app/${symphony.id}`, { headers: headers });
    check(res, { 'status was 200 for /environments/app': (r) => r.status == 200 });

    let environments = res.json('environments');
    let production = environments.find((env) => env.name === 'Production');
    check(production, { 'Production environment was found': (r) => r !== undefined });

    // get users for Symphony
    res = http.get(`${BASE_URL}/users/app/${symphony.id}`, { headers: headers });
    check(res, { 'status was 200 for /users/app': (r) => r.status == 200 });

    let users = res.json();

    return {token, users, symphony, production}
}

export default function (input) {
    
    let {token, users, symphony, production} = input;

    // Use the token in the Authorization header
    let headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    let res;
    
    // get flag states for random user
    let user = users[Math.floor(Math.random() * users.length)];

    let payload = JSON.stringify({
        appId: symphony.id,
        userId: user.id,
        environmentId: production.id,
    });

    
    res = http.post(`${BASE_URL}/flags/state/user`, payload, { headers: headers });
    if (!check(res, { 'status was 200 for /flags/state/user': (r) => r.status == 200 })) {
        console.log(res.body);
    }
    
    if (!check(res, { 'flags were returned': (r) => r.json('flags').length > 0 })) {
        console.log(res.body);
    }

    sleep(1);  // Sleep for 1 second between iterations
}
