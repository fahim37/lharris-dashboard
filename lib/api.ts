const BASE_URL = "http://localhost:5100/api/v1";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDg4ZjMwMzY0NzhjZDFjMTZmZjllNiIsImlhdCI6MTc0NTQxMDI4OCwiZXhwIjoxNzQ2MDE1MDg4fQ.ltTU0CKqhMUPzKnZXiW2nSZrUXYTwNwMEChC0fcZTCk";

// Helper function for API calls
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Admin metrics
export async function getActivePlans() {
  return fetchAPI("/admin/metrics/active-plans");
}

export async function getMonthlyRevenue() {
  return fetchAPI("/admin/metrics/monthly-revenue");
}

export async function getActiveDiscounts() {
  return fetchAPI("/admin/metrics/active-discounts");
}

export async function getTotalClients() {
  return fetchAPI("/admin/metrics/total-client");
}

export async function getTotalAdmins() {
  return fetchAPI("/admin/metrics/total-admin");
}

export async function getTotalStaff() {
  return fetchAPI("/admin/metrics/total-staff");
}

export async function getActiveUsers() {
  return fetchAPI("/admin/metrics/active-users");
}

export async function getInactiveUsers() {
  return fetchAPI("/admin/metrics/inactive-users");
}

export async function getRevenueGrowth() {
  return fetchAPI("/admin/metrics/revenue-growth");
}

// Visit management
export async function createVisit(visitData: any) {
  return fetchAPI("/visits/admin/create-visit", {
    method: "POST",
    body: JSON.stringify(visitData),
  });
}

export async function getAllVisitsCount() {
  return fetchAPI("/visits/admin/get-all-visits-count");
}

export async function getPendingVisitsCount() {
  return fetchAPI("/visits/admin/get-pending-visits-count");
}

export async function getConfirmedVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-confirmed-visits/${userId}`);
}

export async function getPendingVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-pending-visits/${userId}`);
}

export async function getCompletedVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-completed-visits/${userId}`);
}

export async function getCancelledVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-cancelled-visits/${userId}`);
}

export async function updateVisit(visitId: string, visitData: any) {
  return fetchAPI(`/visits/admin/update-visit/${visitId}`, {
    method: "PATCH",
    body: JSON.stringify(visitData),
  });
}

export async function updateVisitStaff(
  visitId: string,
  staffData: { staff: string }
) {
  return fetchAPI(`/visits/admin/update-visit-staff/${visitId}`, {
    method: "PATCH",
    body: JSON.stringify(staffData),
  });
}

export async function getPastVisits(userId: string, page = 1, limit = 10) {
  return fetchAPI(
    `/visits/admin/get-past-visits/${userId}?page=${page}&limit=${limit}`
  );
}

export async function getUpcomingVisits(userId: string, page = 1, limit = 10) {
  return fetchAPI(
    `/visits/admin/get-upcoming-visits/${userId}?page=${page}&limit=${limit}`
  );
}

export async function getConfirmedVisitsCount() {
  return fetchAPI("/visits/admin/get-confirmed-visits-count");
}

export async function getInProgressVisitsCount() {
  return fetchAPI("/visits/admin/get-inProgress-visits-count");
}

export async function getRoutineCheckVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-routineCheck-visits/${userId}`);
}

export async function getEmergencyVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-emergency-visits/${userId}`);
}

export async function getFollowUpVisits(userId: string) {
  return fetchAPI(`/visits/admin/get-followUp-visits/${userId}`);
}

export async function updateVisitStatus(
  visitId: string,
  statusData: { status: string; notes?: string }
) {
  return fetchAPI(`/visits/update-visit-status/${visitId}`, {
    method: "PATCH",
    body: JSON.stringify(statusData),
  });
}

export async function getVisitDetails(visitId: string) {
  return fetchAPI(`/visits/get-visit/${visitId}`);
}

// User management
export async function getAllUsers() {
  return fetchAPI("/admin/all-user");
}

export async function getUsersByRoleAndStatus(role: string, status: string) {
  return fetchAPI(`/admin/user-by-role-status/${role}/${status}`);
}

export async function getUsersByStatus(status: string) {
  return fetchAPI(`/admin/user-by-status/${status}`);
}

export async function addUser(userData: any) {
  return fetchAPI("/admin/add-user", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function updateUser(userId: string, userData: any) {
  return fetchAPI(`/admin/update-user/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function deleteUser(userId: string) {
  return fetchAPI(`/admin/delete-user/${userId}`, {
    method: "DELETE",
  });
}

// Plans management
export async function addPlan(planData: { name: string; price: number }) {
  return fetchAPI("/plans/add-plan", {
    method: "POST",
    body: JSON.stringify(planData),
  });
}

export async function getAllPlans() {
  return fetchAPI("/plans/get-all-plans");
}
