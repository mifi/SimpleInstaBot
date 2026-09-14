import test from 'node:test';
import assert from 'node:assert';

import { findUserInJson, normalizeInstagramUser, parseJsonChunks, getGraphqlFriendlyName } from './userData.ts'; // eslint-disable-line import/extensions

// Real PolarisProfilePageContentQuery response (www.instagram.com/graphql/query, content-type text/javascript), trimmed
const polarisProfilePageContentQueryResponse = {
  data: {
    user: {
      pk: '7238065130',
      aigm_account_label_info: { is_enabled: false },
      friendship_status: null,
      fbid_v2: '17841407233904758',
      is_private: false,
      bio_links: [],
      username: 'iguser7641',
      profile_pic_url: 'https://instagram.example.com/profile_pic.jpg',
      hd_profile_pic_url_info: { url: 'https://instagram.example.com/profile_pic_hd.jpg' },
      biography: 'test',
      full_name: '',
      is_verified: false,
      account_type: 1,
      follower_count: 6,
      mutual_followers_count: null,
      is_business: false,
      biography_with_entities: { entities: [] },
      category: null,
      external_url: '',
      id: '7238065130',
      is_professional_account: false,
      following_count: 44,
      media_count: 0,
    },
    viewer: {
      user: { pk: '7238065130', id: '7238065130', can_see_organic_insights: true },
    },
  },
  extensions: { is_final: true },
};

test('finds and normalizes user in PolarisProfilePageContentQuery response', () => {
  const user = findUserInJson(polarisProfilePageContentQueryResponse, 'IGUSER7641');
  assert.deepStrictEqual(user, {
    id: '7238065130',
    username: 'iguser7641',
    edge_followed_by: { count: 6 },
    edge_follow: { count: 44 },
    is_private: false,
    is_verified: false,
    is_business_account: false,
    is_professional_account: false,
    full_name: '',
    biography: 'test',
    profile_pic_url_hd: 'https://instagram.example.com/profile_pic_hd.jpg',
    external_url: null,
    business_category_name: null,
    category_name: null,
  });

  assert.strictEqual(findUserInJson(polarisProfilePageContentQueryResponse, 'otheruser'), undefined);
  assert.strictEqual(findUserInJson(polarisProfilePageContentQueryResponse)?.username, 'iguser7641');
});

test('normalizes business/creator accounts', () => {
  const user = normalizeInstagramUser({ pk: 1, username: 'biz', follower_count: 1, following_count: 2, is_private: true, is_verified: true, is_business: true, category: 'Artist', external_url: 'https://example.com' });
  assert(user);
  assert.strictEqual(user.id, '1');
  assert.strictEqual(user.is_business_account, true);
  assert.strictEqual(user.is_professional_account, true);
  assert.strictEqual(user.category_name, 'Artist');
  assert.strictEqual(user.external_url, 'https://example.com');
  assert.strictEqual(normalizeInstagramUser({ pk: 1, username: 'creator', follower_count: 1, following_count: 2, is_private: false, account_type: 3 })?.is_professional_account, true);
});

test('does not match user objects without follower counts', () => {
  assert.strictEqual(findUserInJson({ data: { user: { pk: '1', username: 'someuser', is_private: false, is_verified: false } } }, 'someuser'), undefined);
});

const oldWebProfileInfoResponse = {
  data: { user: { id: '9', username: 'old', edge_followed_by: { count: 1 }, edge_follow: { count: 2 }, is_private: true, is_verified: false, is_business_account: false, is_professional_account: false, full_name: '', biography: '', profile_pic_url_hd: '', external_url: null, business_category_name: null, category_name: null } },
};

test('finds user in old web_profile_info response', () => {
  assert.strictEqual(findUserInJson(oldWebProfileInfoResponse, 'OLD')?.id, '9');
});

test('finds user in relay preload cache with stringified response', () => {
  const relay = { require: [['ScheduledServerJS', 'handle', null, [{ __bbox: { require: [['RelayPrefetchedStreamCache', 'next', [], ['adp_X', { __bbox: { complete: true, result: { response: JSON.stringify(oldWebProfileInfoResponse) } } }]]] } }]]] };
  assert.strictEqual(findUserInJson(relay, 'old')?.id, '9');

  const relayNew = { require: [['ScheduledServerJS', 'handle', null, [{ __bbox: { require: [['RelayPrefetchedStreamCache', 'next', [], ['adp_PolarisProfilePageContentQuery_x', { __bbox: { complete: true, result: polarisProfilePageContentQueryResponse } }]]] } }]]] };
  assert.strictEqual(findUserInJson(relayNew, 'iguser7641')?.id, '7238065130');
});

test('parses streamed multi-object responses', () => {
  const chunks = parseJsonChunks(`${JSON.stringify({ a: 1 })}\n${JSON.stringify(polarisProfilePageContentQueryResponse)}\n`);
  assert.strictEqual(chunks.length, 2);
  assert.strictEqual(findUserInJson(chunks, 'iguser7641')?.id, '7238065130');
});

test('gets GraphQL friendly name', () => {
  assert.strictEqual(getGraphqlFriendlyName({ 'x-fb-friendly-name': 'PolarisProfilePageContentQuery' }, undefined), 'PolarisProfilePageContentQuery');
  assert.strictEqual(getGraphqlFriendlyName({}, 'av=1&fb_api_req_friendly_name=PolarisProfilePageContentQuery&server_timestamps=true'), 'PolarisProfilePageContentQuery');
  assert.strictEqual(getGraphqlFriendlyName({}, 'av=1'), undefined);
});
