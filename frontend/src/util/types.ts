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
        image: {
          spotifyUrl: string;
          overwritten: boolean;
          s3key: string;
          height: number | null;
          width: number | null;
        };
        type: string;
        uri: string;
      },
      _id: string;
      refreshToken: string;
      friends: {
        friendId: string;
        status: string;
        _id: string;
      }[];
      groups: {
        id: string;
        status: string;
      }[];
    };
  }
}