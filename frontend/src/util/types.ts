export type StoreType = {
  auth: {
    isAuthenticated: boolean;
    user: {
      _json: {
        external_urls: {
          spotify: string;
        },
        followers: {
          href: string | null;
          total: number | null;
        },
        display_name: string;
        href: string | null;
        id: string;
        images: {
          url: string;
          height: number | null;
          width: number | null;
        }[];
        type: string;
        uri: string;
      },
      _id: string;
      refreshToken: string;
      friends: string[];
      groups: {
        id: string;
        status: string;
      }[];
    };
  }
}