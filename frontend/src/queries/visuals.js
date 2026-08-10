import { gql } from "@apollo/client";

export const MY_VISUALS = gql`
  query VisualsQuery($where: VisualWhereInput!) {
    visuals(where: $where) {
      author {
        id
        username
      }
      code {
        url
      }
      cover {
        url
      }
      title
      createdAt
      description
      parameters
      id
      docs
      docsVisible
      extensions
      likes {
        id
      }
      collaborators {
        id
        username
      }
      privacy
      tags {
        id
        label
      }
    }
  }
`;

// Card-sized projection for list views (menu grid, AI suggestions).
// Deliberately omits `docs`, which is the full ProseMirror document and is by
// far the largest field on a Visual — never rendered in a list. Also omits
// extensions/privacy/docsVisible/tags/collaborators, none of which a card uses.
// Use MY_VISUALS when opening a single visual.
export const VISUAL_CARDS = gql`
  query VisualCards($where: VisualWhereInput!) {
    visuals(where: $where) {
      id
      title
      description
      createdAt
      parameters
      author {
        id
        username
      }
      cover {
        url
      }
      code {
        url
      }
      likes {
        id
      }
    }
  }
`;

export const SEARCH_VISUALS = gql`
  query GetOtherVisual($visID: ID!, $title: String) {
    visuals(
      where: {
        OR: [{ id: { equals: $visID } }, { title: { contains: $title } }]
      }
    ) {
      title
      code {
        url
      }
      cover {
        url
      }
      id
      author {
        username
      }
      createdAt
      parameters
    }
  }
`;

// Every field the dashboard can write through this mutation is selected back,
// `id` first: without it Apollo can't key the result onto the cached Visual, so
// the update lands in ROOT_MUTATION and the open query keeps serving the stale
// value. `docs` is deliberately left out — it is the largest field on a Visual
// and returning it would double the payload of every debounced code save.
export const CHANGE_VISUAL = gql`
  mutation ChangeVisual(
    $where: VisualWhereUniqueInput!
    $data: VisualUpdateInput!
  ) {
    updateVisual(where: $where, data: $data) {
      id
      title
      description
      privacy
      docsVisible
      extensions
      parameters
      code {
        url
      }
      cover {
        url
      }
    }
  }
`;

export const NEW_VISUAL = gql`
  mutation NewVisual($data: VisualCreateInput!) {
    createVisual(data: $data) {
      id
    }
  }
`;

export const GET_ALL_TAGS = gql`
  query AllTags {
    yQTags {
      label
    }
  }
`;

export const DELETE_VISUAL = gql`
  mutation DeleteVisual($id: ID!) {
    deleteVisual(where: { id: $id }) {
      id
    }
  }
`;

export const LIKE_VISUAL = gql`
  mutation UpdateVisual($id: ID!, $userID: ID!) {
    updateVisual(
      data: { likes: { connect: [{ id: $userID }] } }
      where: { id: $id }
    ) {
      likesCount
    }
  }
`;


export const UNLIKE_VISUAL = gql`
  mutation UpdateVisual($id: ID!, $userID: ID!) {
    updateVisual(
      data: { likes: { disconnect: [{ id: $userID }] } }
      where: { id: $id }
    ) {
      likesCount
    }
  }
`;


export const ADD_COLLABORATOR = gql`
  mutation AddCollaborator($id: ID!, $userID: ID!) {
    updateVisual(
      data: { collaborators: { connect: [{ id: $userID }] } }
      where: { id: $id }
    ) {
      collaborators {
        id
        username
      }
    }
  }
`

export const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator($id: ID!, $userID: ID!) {
    updateVisual(
      data: { collaborators: { disconnect: [{ id: $userID }] } }
      where: { id: $id }
    ) {
      collaborators {
        id
        username
      }
    }
  }
`

export const GET_USERS_IN_CLASS = gql`
  query GetUsersInClass($classIDs: [ID!]) {
    profiles(
      where: {
        OR: [
          { studentIn: { some: { id: { in: $classIDs } } } },
          { teacherIn: { some: { id: { in: $classIDs } } } },
          { mentorIn: { some: { id: { in: $classIDs } } } }
        ]
      }
    ) {
      id
      username
      permissions {
        name
      }  
    }
  }
`

export const SEARCH_COLLABORATORS = gql`
  query SearchCollaborators($userID: ID!, $username: String, $classIDs: [ID!]) {
    profiles(
      where: {
        AND: [
          {
            OR: [
              { id: { equals: $userID } },
              { username: { equals: $username } }
            ]
          },
          {
            OR: [
              { studentIn: { some: { id: { in: $classIDs } } } },
              { teacherIn: { some: { id: { in: $classIDs } } } },
              { mentorIn: { some: { id: { in: $classIDs } } } }
            ]
          }
        ]
      }
    ) {
      id
      username
      visualsCount
      visuals {
        id
        createdAt
        likesCount
      }
    }
  }

`