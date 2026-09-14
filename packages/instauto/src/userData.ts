export interface InstagramUser {
  id: string;
  username?: string;
  edge_followed_by: { count: number };
  edge_follow: { count: number };
  is_private: boolean;
  is_verified: boolean;
  is_business_account: boolean;
  is_professional_account: boolean;
  full_name: string;
  biography: string;
  profile_pic_url_hd: string;
  external_url: string | null;
  business_category_name: string | null;
  category_name: string | null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// The old web_profile_info shape
export function isInstagramUser(value: unknown): value is InstagramUser {
  if (!isRecord(value)) return false;
  const { id, edge_followed_by: edgeFollowedBy, edge_follow: edgeFollow, is_private: isPrivate, is_verified: isVerified } = value;
  return typeof id === 'string'
    && isRecord(edgeFollowedBy)
    && isRecord(edgeFollow)
    && typeof isPrivate === 'boolean'
    && typeof isVerified === 'boolean';
}

// Instagram's web client now loads profile data through GraphQL (PolarisProfilePageContentQuery),
// which uses a different shape (follower_count etc.) than the old web_profile_info endpoint.
// Normalize both shapes into InstagramUser
export function normalizeInstagramUser(value: unknown): InstagramUser | undefined {
  if (isInstagramUser(value)) return value;
  if (!isRecord(value)) return undefined;

  const {
    id, pk, username, follower_count: followerCount, following_count: followingCount, is_private: isPrivate, is_verified: isVerified,
    is_business: isBusiness, is_business_account: isBusinessAccount, is_professional_account: isProfessionalAccount, account_type: accountType,
    full_name: fullName, biography, profile_pic_url: profilePicUrl, hd_profile_pic_url_info: hdProfilePicUrlInfo, external_url: externalUrl,
    category, category_name: categoryName, business_category_name: businessCategoryName,
  } = value;

  const rawId = id ?? pk;
  if (typeof rawId !== 'string' && typeof rawId !== 'number') return undefined;
  if (typeof username !== 'string') return undefined;
  if (typeof followerCount !== 'number' || typeof followingCount !== 'number') return undefined;
  if (typeof isPrivate !== 'boolean') return undefined;

  const hdProfilePicUrl = isRecord(hdProfilePicUrlInfo) ? hdProfilePicUrlInfo['url'] : undefined;
  const isBusinessAccountNormalized = isBusiness === true || isBusinessAccount === true;

  return {
    id: String(rawId),
    username,
    edge_followed_by: { count: followerCount },
    edge_follow: { count: followingCount },
    is_private: isPrivate,
    is_verified: isVerified === true,
    is_business_account: isBusinessAccountNormalized,
    // account_type 2 = business, 3 = creator
    is_professional_account: isProfessionalAccount === true || isBusinessAccountNormalized || accountType === 2 || accountType === 3,
    full_name: typeof fullName === 'string' ? fullName : '',
    biography: typeof biography === 'string' ? biography : '',
    profile_pic_url_hd: typeof hdProfilePicUrl === 'string' ? hdProfilePicUrl : (typeof profilePicUrl === 'string' ? profilePicUrl : ''),
    external_url: typeof externalUrl === 'string' && externalUrl !== '' ? externalUrl : null,
    business_category_name: typeof businessCategoryName === 'string' ? businessCategoryName : null,
    category_name: typeof categoryName === 'string' ? categoryName : (typeof category === 'string' ? category : null),
  };
}

// Recursively look for a user object (e.g. `data.user`) in a GraphQL response or relay preload cache.
// If `username` is given, only a user with that username is accepted.
export function findUserInJson(value: unknown, username?: string, depth = 0): InstagramUser | undefined {
  if (depth > 50) return undefined;

  if (typeof value === 'string') {
    // the relay preload cache sometimes contains a stringified JSON response
    if (value.length > 500000 || !value.trimStart().startsWith('{') || !value.includes('"user"')) return undefined;
    try {
      return findUserInJson(JSON.parse(value), username, depth + 1);
    } catch {
      return undefined;
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findUserInJson(item, username, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  if (!isRecord(value)) return undefined;

  const user = normalizeInstagramUser(value);
  if (user && (username == null || user.username == null || user.username.toLowerCase() === username.toLowerCase())) return user;

  for (const child of Object.values(value)) {
    const found = findUserInJson(child, username, depth + 1);
    if (found) return found;
  }
  return undefined;
}

// Some GraphQL responses are streamed as multiple newline separated JSON objects
export function parseJsonChunks(text: string): unknown[] {
  try {
    return [JSON.parse(text)];
  } catch {
    const ret: unknown[] = [];
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('{')) {
        try {
          ret.push(JSON.parse(line));
        } catch {
          // ignore
        }
      }
    }
    return ret;
  }
}

// e.g. PolarisProfilePageContentQuery
export function getGraphqlFriendlyName(headers: Record<string, string>, postData: string | undefined): string | undefined {
  const fromHeader = headers['x-fb-friendly-name'];
  if (fromHeader) return fromHeader;
  const match = postData?.match(/(?:^|&)fb_api_req_friendly_name=([^&]+)/);
  return match?.[1] != null ? decodeURIComponent(match[1]) : undefined;
}
