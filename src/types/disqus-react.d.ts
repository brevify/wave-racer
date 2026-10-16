declare module 'disqus-react' {
  import * as React from 'react';

  export interface DiscussionEmbedConfig {
    url?: string;
    identifier?: string;
    title?: string;
    language?: string;
    remoteAuthS3?: string;
    apiKey?: string;
    sso?: {
      name?: string;
      button?: string;
      icon?: string;
      url?: string;
      logout?: string;
      profile_url?: string;
      width?: string;
      height?: string;
    };
  }

  export interface DiscussionEmbedProps {
    shortname: string;
    config: DiscussionEmbedConfig;
  }

  export class DiscussionEmbed extends React.Component<DiscussionEmbedProps> {}

  export interface CommentCountProps {
    shortname: string;
    config: DiscussionEmbedConfig;
    children?: React.ReactNode;
  }

  export class CommentCount extends React.Component<CommentCountProps> {}
}
