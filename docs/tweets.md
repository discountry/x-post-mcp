# Create or Edit Post

> Creates a new Post for the authenticated user, or edits an existing Post when edit_options are provided.



## OpenAPI

````yaml post /2/tweets
openapi: 3.0.0
info:
  description: X API v2 available endpoints
  version: '2.157'
  title: X API v2
  termsOfService: https://developer.x.com/en/developer-terms/agreement-and-policy.html
  contact:
    name: X Developers
    url: https://developer.x.com/
  license:
    name: X Developer Agreement and Policy
    url: https://developer.x.com/en/developer-terms/agreement-and-policy.html
servers:
  - description: X API
    url: https://api.x.com
security: []
tags:
  - name: Account Activity
    description: Endpoints relating to retrieving, managing AAA subscriptions
    externalDocs:
      description: Find out more
      url: >-
        https://docs.x.com/x-api/enterprise-gnip-2.0/fundamentals/account-activity
  - name: Bookmarks
    description: Endpoints related to retrieving, managing bookmarks of a user
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/bookmarks
  - name: Compliance
    description: Endpoints related to keeping X data in your systems compliant
    externalDocs:
      description: Find out more
      url: >-
        https://developer.twitter.com/en/docs/twitter-api/compliance/batch-tweet/introduction
  - name: Connections
    description: Endpoints related to streaming connections
    externalDocs:
      description: Find out more
      url: https://developer.x.com/en/docs/x-api/connections
  - name: Direct Messages
    description: Endpoints related to retrieving, managing Direct Messages
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/direct-messages
  - name: General
    description: Miscellaneous endpoints for general API functionality
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api
  - name: Lists
    description: Endpoints related to retrieving, managing Lists
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/lists
  - name: Media
    description: Endpoints related to Media
    externalDocs:
      description: Find out more
      url: https://developer.x.com
  - name: MediaUpload
    description: Endpoints related to uploading Media
    externalDocs:
      description: Find out more
      url: https://developer.x.com
  - name: News
    description: Endpoint for retrieving news stories
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/news
  - name: Spaces
    description: Endpoints related to retrieving, managing Spaces
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/spaces
  - name: Stream
    description: Endpoints related to streaming
    externalDocs:
      description: Find out more
      url: https://developer.x.com
  - name: Tweets
    description: Endpoints related to retrieving, searching, and modifying Tweets
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/tweets/lookup
  - name: Users
    description: Endpoints related to retrieving, managing relationships of Users
    externalDocs:
      description: Find out more
      url: https://developer.twitter.com/en/docs/twitter-api/users/lookup
paths:
  /2/tweets:
    post:
      tags:
        - Tweets
      summary: Create or Edit Post
      description: >-
        Creates a new Post for the authenticated user, or edits an existing Post
        when edit_options are provided.
      operationId: createPosts
      parameters: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TweetCreateRequest'
        required: true
      responses:
        '201':
          description: The request has succeeded.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TweetCreateResponse'
        default:
          description: The request has failed.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
            application/problem+json:
              schema:
                $ref: '#/components/schemas/Problem'
      security:
        - OAuth2UserToken:
            - tweet.read
            - tweet.write
            - users.read
        - UserToken: []
      externalDocs:
        url: >-
          https://developer.x.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
components:
  schemas:
    TweetCreateRequest:
      type: object
      properties:
        card_uri:
          type: string
          description: >-
            Card Uri Parameter. This is mutually exclusive from Quote Tweet Id,
            Poll, Media, and Direct Message Deep Link.
        community_id:
          $ref: '#/components/schemas/CommunityId'
        direct_message_deep_link:
          type: string
          description: >-
            Link to take the conversation from the public timeline to a private
            Direct Message.
        edit_options:
          type: object
          description: >-
            Options for editing an existing Post. When provided, this request
            will edit the specified Post instead of creating a new one.
          required:
            - previous_post_id
          properties:
            previous_post_id:
              $ref: '#/components/schemas/TweetId'
          additionalProperties: false
        for_super_followers_only:
          type: boolean
          description: Exclusive Tweet for super followers.
          default: false
        geo:
          type: object
          description: Place ID being attached to the Tweet for geo location.
          properties:
            place_id:
              type: string
          additionalProperties: false
        media:
          type: object
          description: >-
            Media information being attached to created Tweet. This is mutually
            exclusive from Quote Tweet Id, Poll, and Card URI.
          required:
            - media_ids
          properties:
            media_ids:
              type: array
              description: A list of Media Ids to be attached to a created Tweet.
              minItems: 1
              maxItems: 4
              items:
                $ref: '#/components/schemas/MediaId'
            tagged_user_ids:
              type: array
              description: A list of User Ids to be tagged in the media for created Tweet.
              minItems: 0
              maxItems: 10
              items:
                $ref: '#/components/schemas/UserId'
          additionalProperties: false
        nullcast:
          type: boolean
          description: >-
            Nullcasted (promoted-only) Posts do not appear in the public
            timeline and are not served to followers.
          default: false
        poll:
          type: object
          description: >-
            Poll options for a Tweet with a poll. This is mutually exclusive
            from Media, Quote Tweet Id, and Card URI.
          required:
            - options
            - duration_minutes
          properties:
            duration_minutes:
              type: integer
              description: Duration of the poll in minutes.
              minimum: 5
              maximum: 10080
              format: int32
            options:
              type: array
              minItems: 2
              maxItems: 4
              items:
                type: string
                description: The text of a poll choice.
                minLength: 1
                maxLength: 25
            reply_settings:
              type: string
              description: Settings to indicate who can reply to the Tweet.
              enum:
                - following
                - mentionedUsers
                - subscribers
                - verified
          additionalProperties: false
        quote_tweet_id:
          $ref: '#/components/schemas/TweetId'
        reply:
          type: object
          description: Tweet information of the Tweet being replied to.
          required:
            - in_reply_to_tweet_id
          properties:
            auto_populate_reply_metadata:
              type: boolean
              description: If set to true, reply metadata will be automatically populated.
            exclude_reply_user_ids:
              type: array
              description: A list of User Ids to be excluded from the reply Tweet.
              items:
                $ref: '#/components/schemas/UserId'
            in_reply_to_tweet_id:
              $ref: '#/components/schemas/TweetId'
          additionalProperties: false
        reply_settings:
          type: string
          description: Settings to indicate who can reply to the Tweet.
          enum:
            - following
            - mentionedUsers
            - subscribers
            - verified
        share_with_followers:
          type: boolean
          description: Share community post with followers too.
          default: false
        text:
          $ref: '#/components/schemas/TweetText'
      additionalProperties: false
    TweetCreateResponse:
      type: object
      properties:
        data:
          type: object
          required:
            - id
            - text
          properties:
            id:
              $ref: '#/components/schemas/TweetId'
            text:
              $ref: '#/components/schemas/TweetText'
        errors:
          type: array
          minItems: 1
          items:
            $ref: '#/components/schemas/Problem'
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
    Problem:
      type: object
      description: >-
        An HTTP Problem Details object, as defined in IETF RFC 7807
        (https://tools.ietf.org/html/rfc7807).
      required:
        - type
        - title
      properties:
        detail:
          type: string
        status:
          type: integer
        title:
          type: string
        type:
          type: string
      discriminator:
        propertyName: type
        mapping:
          about:blank: '#/components/schemas/GenericProblem'
          https://api.twitter.com/2/problems/client-disconnected: '#/components/schemas/ClientDisconnectedProblem'
          https://api.twitter.com/2/problems/client-forbidden: '#/components/schemas/ClientForbiddenProblem'
          https://api.twitter.com/2/problems/conflict: '#/components/schemas/ConflictProblem'
          https://api.twitter.com/2/problems/disallowed-resource: '#/components/schemas/DisallowedResourceProblem'
          https://api.twitter.com/2/problems/duplicate-rules: '#/components/schemas/DuplicateRuleProblem'
          https://api.twitter.com/2/problems/invalid-request: '#/components/schemas/InvalidRequestProblem'
          https://api.twitter.com/2/problems/invalid-rules: '#/components/schemas/InvalidRuleProblem'
          https://api.twitter.com/2/problems/noncompliant-rules: '#/components/schemas/NonCompliantRulesProblem'
          https://api.twitter.com/2/problems/not-authorized-for-field: '#/components/schemas/FieldUnauthorizedProblem'
          https://api.twitter.com/2/problems/not-authorized-for-resource: '#/components/schemas/ResourceUnauthorizedProblem'
          https://api.twitter.com/2/problems/operational-disconnect: '#/components/schemas/OperationalDisconnectProblem'
          https://api.twitter.com/2/problems/resource-not-found: '#/components/schemas/ResourceNotFoundProblem'
          https://api.twitter.com/2/problems/resource-unavailable: '#/components/schemas/ResourceUnavailableProblem'
          https://api.twitter.com/2/problems/rule-cap: '#/components/schemas/RulesCapProblem'
          https://api.twitter.com/2/problems/streaming-connection: '#/components/schemas/ConnectionExceptionProblem'
          https://api.twitter.com/2/problems/unsupported-authentication: '#/components/schemas/UnsupportedAuthenticationProblem'
          https://api.twitter.com/2/problems/usage-capped: '#/components/schemas/UsageCapExceededProblem'
    CommunityId:
      type: string
      description: The unique identifier of this Community.
      pattern: ^[0-9]{1,19}$
      example: '1146654567674912769'
    TweetId:
      type: string
      description: >-
        Unique identifier of this Tweet. This is returned as a string in order
        to avoid complications with languages and tools that cannot handle large
        integers.
      pattern: ^[0-9]{1,19}$
      example: '1346889436626259968'
    MediaId:
      type: string
      description: The unique identifier of this Media.
      pattern: ^[0-9]{1,19}$
      example: '1146654567674912769'
    UserId:
      type: string
      description: >-
        Unique identifier of this User. This is returned as a string in order to
        avoid complications with languages and tools that cannot handle large
        integers.
      pattern: ^[0-9]{1,19}$
      example: '2244994945'
    TweetText:
      type: string
      description: The content of the Tweet.
      example: >-
        Learn how to use the user Tweet timeline and user mention timeline
        endpoints in the X API v2 to explore Tweet\u2026
        https:\/\/t.co\/56a0vZUx7i
  securitySchemes:
    OAuth2UserToken:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://api.x.com/2/oauth2/authorize
          tokenUrl: https://api.x.com/2/oauth2/token
          scopes:
            block.read: View accounts you have blocked.
            bookmark.read: Read your bookmarked Posts.
            bookmark.write: Create and delete your bookmarks.
            dm.read: Read all your Direct Messages.
            dm.write: Send and manage your Direct Messages.
            follows.read: View accounts you follow and accounts following you.
            follows.write: Follow and unfollow accounts on your behalf.
            like.read: View Posts you have liked and likes you can see.
            like.write: Like and unlike Posts on your behalf.
            list.read: >-
              View Lists, members, and followers of Lists you created or are a
              member of, including private Lists.
            list.write: Create and manage Lists on your behalf.
            media.write: Upload media, such as photos and videos, on your behalf.
            mute.read: View accounts you have muted.
            mute.write: Mute and unmute accounts on your behalf.
            offline.access: Request a refresh token for the app.
            space.read: View all Spaces you have access to.
            timeline.read: >-
              View all Custom Timelines you can see, including public Custom
              Timelines from other developers.
            tweet.moderate.write: Hide and unhide replies to your Posts.
            tweet.read: >-
              View all Posts you can see, including those from protected
              accounts.
            tweet.write: Post and repost on your behalf.
            users.read: View any account you can see, including protected accounts.
    UserToken:
      type: http
      scheme: OAuth

````

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://docs.x.com/llms.txt