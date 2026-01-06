/**
 * Navigation Helper Utility
 * 
 * Handles the logic for determining where to navigate based on user's state:
 * - Onboarding status
 * - Declaration flow status
 * - "Start using" screen status
 */

import { ROUTES } from '../config/constants';

// localStorage keys for flow tracking
export const FLOW_KEYS = {
  // Set to 'true' when user completes onboarding (clicks "Bắt đầu sử dụng" on AdvancedSetupScreen)
  JUST_COMPLETED_ONBOARDING: 'justCompletedOnboarding',
  // Set to 'true' when user has seen and interacted with the setup guide modal
  HAS_SEEN_SETUP_GUIDE_MODAL: 'hasSeenSetupGuideModal',
  // Set to 'true' when user clicks "Bỏ qua" on declaration modal - won't show again
  DECLARATION_SKIPPED: 'declarationSkipped',
  // Set to 'true' when user has clicked "Bắt đầu sử dụng" button on the welcome/start using screen
  HAS_STARTED_USING: 'hasStartedUsing',
};

export interface FlowState {
  onboardingCompleted: boolean;
  declarationSkipped: boolean;
  hasSeenSetupGuideModal: boolean;
  hasStartedUsing: boolean;
  justCompletedOnboarding: boolean;
}

/**
 * Get the current flow state from localStorage
 */
export const getFlowState = (): FlowState => {
  return {
    onboardingCompleted: false, // This should come from tenant data, not localStorage
    declarationSkipped: localStorage.getItem(FLOW_KEYS.DECLARATION_SKIPPED) === 'true',
    hasSeenSetupGuideModal: localStorage.getItem(FLOW_KEYS.HAS_SEEN_SETUP_GUIDE_MODAL) === 'true',
    hasStartedUsing: localStorage.getItem(FLOW_KEYS.HAS_STARTED_USING) === 'true',
    justCompletedOnboarding: localStorage.getItem(FLOW_KEYS.JUST_COMPLETED_ONBOARDING) === 'true',
  };
};

/**
 * Determine where to navigate after login based on tenant's onboarding state
 * 
 * Flow logic:
 * 1. If onboarding NOT completed → go to ONBOARDING_WELCOME (restart from beginning, data prefilled)
 * 2. If onboarding completed AND declaration skipped → go to HOME (no modal)
 * 3. If onboarding completed AND declaration NOT skipped → go to HOME (show modal if not seen yet)
 */
export const getNavigationRouteAfterLogin = (
  tenant: { onboardingCompleted: boolean } | null
): string => {
  if (!tenant) {
    return ROUTES.PROCESSING;
  }

  // Case 1: Onboarding not completed - restart from beginning with prefilled data
  if (!tenant.onboardingCompleted) {
    return ROUTES.ONBOARDING_WELCOME;
  }

  // Case 2 & 3: Onboarding completed - check declaration status
  const flowState = getFlowState();

  // If user skipped declaration, go straight to home without showing modal
  if (flowState.declarationSkipped) {
    return ROUTES.HOME;
  }

  // User hasn't skipped - show modal on home
  if (!flowState.hasSeenSetupGuideModal) {
    localStorage.setItem(FLOW_KEYS.JUST_COMPLETED_ONBOARDING, 'true');
  }
  
  return ROUTES.HOME;
};

/**
 * Mark declaration as skipped - user won't see the modal again
 */
export const markDeclarationSkipped = (): void => {
  localStorage.setItem(FLOW_KEYS.DECLARATION_SKIPPED, 'true');
  localStorage.setItem(FLOW_KEYS.HAS_SEEN_SETUP_GUIDE_MODAL, 'true');
};

/**
 * Mark that user has started using the app (clicked "Bắt đầu sử dụng")
 */
export const markStartedUsing = (): void => {
  localStorage.setItem(FLOW_KEYS.HAS_STARTED_USING, 'true');
};

/**
 * Clear all flow state for a tenant (useful when switching tenants)
 */
export const clearFlowState = (): void => {
  localStorage.removeItem(FLOW_KEYS.JUST_COMPLETED_ONBOARDING);
  localStorage.removeItem(FLOW_KEYS.HAS_SEEN_SETUP_GUIDE_MODAL);
  localStorage.removeItem(FLOW_KEYS.DECLARATION_SKIPPED);
  localStorage.removeItem(FLOW_KEYS.HAS_STARTED_USING);
};

/**
 * Get tenant-specific storage key
 * This ensures flow state is tracked per tenant
 */
export const getTenantStorageKey = (tenantId: string, key: string): string => {
  return `${tenantId}_${key}`;
};

/**
 * Get flow state for a specific tenant
 */
export const getTenantFlowState = (tenantId: string): FlowState => {
  return {
    onboardingCompleted: false,
    declarationSkipped: localStorage.getItem(getTenantStorageKey(tenantId, FLOW_KEYS.DECLARATION_SKIPPED)) === 'true',
    hasSeenSetupGuideModal: localStorage.getItem(getTenantStorageKey(tenantId, FLOW_KEYS.HAS_SEEN_SETUP_GUIDE_MODAL)) === 'true',
    hasStartedUsing: localStorage.getItem(getTenantStorageKey(tenantId, FLOW_KEYS.HAS_STARTED_USING)) === 'true',
    justCompletedOnboarding: localStorage.getItem(getTenantStorageKey(tenantId, FLOW_KEYS.JUST_COMPLETED_ONBOARDING)) === 'true',
  };
};

/**
 * Mark declaration as skipped for a specific tenant
 */
export const markTenantDeclarationSkipped = (tenantId: string): void => {
  localStorage.setItem(getTenantStorageKey(tenantId, FLOW_KEYS.DECLARATION_SKIPPED), 'true');
  localStorage.setItem(getTenantStorageKey(tenantId, FLOW_KEYS.HAS_SEEN_SETUP_GUIDE_MODAL), 'true');
};

/**
 * Mark that user has started using the app for a specific tenant
 */
export const markTenantStartedUsing = (tenantId: string): void => {
  localStorage.setItem(getTenantStorageKey(tenantId, FLOW_KEYS.HAS_STARTED_USING), 'true');
};

/**
 * Set justCompletedOnboarding flag for a specific tenant
 */
export const markTenantJustCompletedOnboarding = (tenantId: string): void => {
  localStorage.setItem(getTenantStorageKey(tenantId, FLOW_KEYS.JUST_COMPLETED_ONBOARDING), 'true');
  // Clear any old "seen modal" flag so the modal will show
  localStorage.removeItem(getTenantStorageKey(tenantId, FLOW_KEYS.HAS_SEEN_SETUP_GUIDE_MODAL));
};

/**
 * Clear justCompletedOnboarding flag after showing modal
 */
export const clearTenantJustCompletedOnboarding = (tenantId: string): void => {
  localStorage.removeItem(getTenantStorageKey(tenantId, FLOW_KEYS.JUST_COMPLETED_ONBOARDING));
};
