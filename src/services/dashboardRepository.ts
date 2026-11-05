import { fixtures } from "../data/fixtures";
import type { Company, Branch, Dataset } from "../domain/types";
export interface DashboardRepository {
  getCompanies(): Promise<Company[]>;
  getBranches(): Promise<Branch[]>;
  getDashboardData(): Promise<Dataset>;
}
export const dashboardRepository: DashboardRepository = {
  getCompanies: async () => fixtures.companies,
  getBranches: async () => fixtures.branches,
  getDashboardData: () =>
    new Promise((resolve) => setTimeout(() => resolve(fixtures), 350)),
};
