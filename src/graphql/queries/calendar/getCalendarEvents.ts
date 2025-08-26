import { gql } from '@apollo/client';

export const GET_CALENDAR_EVENTS = gql`
    query GetCalendarEvents($workspaceId: ID!, $start: String!, $end: String!) {
        calendar(workspaceId: $workspaceId, start: $start, end: $end) {
        id
        title
        description
        start
        end
        allDay
        isArchived
        location
        visibility
        notification
        
        eventType {
            id
            name
            backgroundColor
            borderColor
        }
        
        assignedTo {
            ... on UserAssigned {
            id
            name
            avatarUrl
            teamRole
            }
            ... on Company {
            _id
            name
            }
        }
        
        invitedPeople {
            id
            name
            avatarUrl
            teamRole
        }
        
        links {
            _id
            url
            title
            favicon
        }
        
        files {
            _id
            name
            url
            ext
            size
        }
        }
    }
`;

export const GET_EVENT_TYPES = gql`
    query GetEventTypes($workspaceId: ID!) {
        eventTypes(workspaceId: $workspaceId) {
        id
        name
        backgroundColor
        borderColor
        }
    }
`;