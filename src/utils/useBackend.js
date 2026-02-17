/**
 * useBackend Hook - Integrates database operations with React state
 * Uses Supabase for web, falls back to localStorage
 */

// Re-export from the Supabase version
export { useBackend, useBackend as default } from "./useBackendSupabase";
