import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://sweetflags.dev.gcp.sweetwater.com/api';
const BASE_AUTH0_URL = 'https://dev-sweetwater-internal.us.auth0.com/oauth/token';
let token;

export let options = {
    vus: 100,  // Number of virtual users
    duration: '30s',  // Test duration
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
    };

    // get apps
    res = http.get(`${BASE_URL}/apps`, { headers: headers });
    check(res, { 'status was 200 for /apps': (r) => r.status == 200 });

    // find Symphony in the response
    let app = res.json().find((app) => app.name === 'Symphony');

    // get flags for Symphony
    res = http.get(`${BASE_URL}/flags/app/${app.id}`, { headers: headers });
    check(res, { 'status was 200 for /flags/app': (r) => r.status == 200 });

    let flags = res.json();

    return {token, app, flags}
}

export default function (input) {
    // Use the token in the Authorization header
    let headers = {
        'Authorization': `Bearer ${input.token}`,
        'Content-Type': 'application/json',
    };

    let res;

    // get flag state for random flags
    let flag = input.flags[Math.floor(Math.random() * input.flags.length)];
    let payload = JSON.stringify({
        'flagId': flag.id,
        'appId': input.app.id,
        'environmentId': '645572fb023dae27b0f713dc',
    });
    res = http.post(`${BASE_URL}/flags/state/id`, payload, { headers: headers });
    if (!check(res, { 'status was 200 for /flags/state/id': (r) => r.status == 200 })) {
        console.log(res.body);
        console.log(payload);
    }
}