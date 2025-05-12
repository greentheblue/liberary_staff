// This is a simple session management utility
// In a real application, this would be replaced with a proper session management system

export type EntityType = 'school' | 'organization' | 'other';

interface SessionData {
  entity_type: EntityType;
}

// For demonstration purposes, we're storing the session in memory
// In a real application, this would be stored in a database or server-side session
let sessionData: SessionData = {
  entity_type: 'school', // Default value for demonstration
};

export function getSession(): SessionData {
  return sessionData;
}

export function setSession(data: Partial<SessionData>): void {
  sessionData = { ...sessionData, ...data };
}