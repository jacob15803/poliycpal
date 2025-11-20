import type { PolicyArea } from './types';

export const policyDocuments: Record<PolicyArea, string> = {
  IT: `
    IT Policy Document:
    - All employees must use strong, unique passwords for all company accounts, changed every 90 days.
    - Company-issued laptops and devices are for business use primarily. Limited personal use is acceptable but should not interfere with work duties.
    - Installation of unauthorized software on company devices is strictly prohibited. Please contact the IT department for software requests.
    - Report any suspected security incidents, such as phishing emails or unusual account activity, to the IT helpdesk immediately.
    - Connecting to unsecured public Wi-Fi networks without using the company VPN is forbidden.
  `,
  HR: `
    Human Resources Policy Document:
    - Full-time employees are entitled to 20 days of paid vacation per year, accrued monthly.
    - The company observes 10 public holidays annually.
    - Sick leave is provided for employees' health and wellness. Please notify your manager as early as possible if you are unable to work.
    - The company has a zero-tolerance policy for harassment and discrimination. All employees must complete the mandatory respect in the workplace training.
    - For details on health insurance, retirement plans, and other benefits, please refer to the benefits portal or contact the HR department.
  `,
  General: `
    General Company Policy Document:
    - The standard office dress code is business casual.
    - All employees must complete a security awareness training program annually.
    - The office hours are from 9:00 AM to 5:00 PM, Monday to Friday, with a one-hour lunch break. Flexible working arrangements may be available upon manager approval.
    - Employees are expected to maintain a clean and organized workspace.
    - Reimbursement for business-related expenses must be submitted through the expense reporting system with valid receipts within 30 days of the expenditure.
  `,
};

export function getPolicyDocument(area: PolicyArea): string {
  return policyDocuments[area] || '';
}
